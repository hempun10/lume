import { expect, type Page, test } from "@playwright/test";
import { loginAsSeededUser, runLumeSteps, SEEDED_USERS } from "./helpers";

/**
 * Two-browser realtime game lifecycle.
 *
 * This is the canary for the entire game subsystem: the broadcast plumbing
 * is shared across all 7 available games, so locking in invite → accept →
 * synced moves → win on the smallest game (Tic Tac Toe) verifies that the
 * shared transport works end-to-end. Per-engine logic (win lines, draw
 * detection, turn rules) is better covered by Vitest unit tests against
 * the pure functions in `src/features/games/engines/*.ts`.
 *
 * Test shape:
 *   1. Alice + Bob match into a chat (deterministic Playwright + Passmark
 *      for the lobby step — same as `realtime-matchmaking.spec.ts`).
 *   2. Passmark drives Alice through opening the game panel and inviting
 *      Bob to play Tic Tac Toe.
 *   3. Passmark on Bob's side accepts the invite modal.
 *   4. Both browsers render the TTT board.
 *   5. Deterministic Playwright plays a winning sequence (top row for X)
 *      to keep credit usage and flake low. Whichever browser was assigned
 *      seat X is determined dynamically from the "Your turn" status — the
 *      matchmaker decides who is `user_a` (X), so we can't hard-code Alice.
 *   6. Both browsers show the correct end-of-game status ("You won!" /
 *      "You lost").
 *
 * Gated behind RUN_REALTIME_PASSMARK=1 because realtime needs the local
 * Supabase stack (channels + pg_cron + match-users edge function) healthy.
 */
test.describe("Realtime games", () => {
	test.skip(
		process.env.RUN_REALTIME_PASSMARK !== "1",
		"Set RUN_REALTIME_PASSMARK=1 when local Supabase realtime, pg_cron, and edge functions are running.",
	);

	test("two strangers can invite, accept, play Tic Tac Toe to a win, and both see the result", async ({
		browser,
	}, testInfo) => {
		testInfo.setTimeout(240_000);

		const aliceContext = await browser.newContext();
		const bobContext = await browser.newContext();
		const alicePage = await aliceContext.newPage();
		const bobPage = await bobContext.newPage();

		try {
			await loginAsSeededUser({ page: alicePage, user: SEEDED_USERS.alice });
			await loginAsSeededUser({ page: bobPage, user: SEEDED_USERS.bob });

			// Both queue and land in the same chat room.
			await Promise.all([
				runLumeSteps({
					page: alicePage,
					test,
					expect,
					userFlow: "Alice starts realtime matching",
					steps: [
						{
							description: "Click 'Start matching' on the lobby hero card",
							waitUntil: "Alice has been routed into a 1:1 chat room",
						},
					],
					assertions: [],
				}),
				runLumeSteps({
					page: bobPage,
					test,
					expect,
					userFlow: "Bob starts realtime matching",
					steps: [
						{
							description: "Click 'Start matching' on the lobby hero card",
							waitUntil: "Bob has been routed into a 1:1 chat room",
						},
					],
					assertions: [],
				}),
			]);

			// Alice opens the game panel and invites Bob to play Tic Tac Toe.
			// We let Passmark drive these two steps because button labels matter
			// for accessibility and we want the AI to confirm them.
			await runLumeSteps({
				page: alicePage,
				test,
				expect,
				userFlow: "Alice invites Bob to play Tic Tac Toe",
				steps: [
					{
						description: "Click the 'Play a game' button in the chat header",
						waitUntil: "A list of games is visible in the chat panel",
					},
					{
						description:
							"Click the 'Play' button on the Tic Tac Toe row of the games list",
						waitUntil:
							"A 'Waiting for opponent' or 'invite sent' state is visible — Alice has dispatched a Tic Tac Toe invite",
					},
				],
				assertions: [],
			});

			// Bob accepts via Passmark — the modal is what a real user sees.
			await runLumeSteps({
				page: bobPage,
				test,
				expect,
				userFlow: "Bob accepts Alice's Tic Tac Toe invite",
				steps: [
					{
						description:
							"In the 'Game Invite' dialog, click the 'Play' button to accept the Tic Tac Toe invite",
						waitUntil:
							"The Tic Tac Toe board is visible (a 3x3 grid of empty cells)",
					},
				],
				assertions: [
					{
						assertion:
							"Bob is now looking at a Tic Tac Toe game board with 9 empty cells.",
					},
				],
			});

			// Wait until both boards are rendered and the turn indicator has
			// stabilised on at least one side.
			await Promise.all([
				expect(alicePage.getByLabel(/^Cell 1/)).toBeVisible({
					timeout: 15_000,
				}),
				expect(bobPage.getByLabel(/^Cell 1/)).toBeVisible({
					timeout: 15_000,
				}),
			]);

			// The matchmaker decides who is `user_a` (always seat X, goes first),
			// so we discover X dynamically by reading the status text.
			const { x: xPage, o: oPage, xName } = await detectSeats(
				alicePage,
				bobPage,
			);
			testInfo.annotations.push({ type: "seat-X", description: xName });

			// Deterministic top-row win for X:
			//   X plays 1 → O plays 4 → X plays 2 → O plays 5 → X plays 3.
			// We click then explicitly wait for the cell value to appear on the
			// OPPONENT'S board before the next move — that's the realtime sync
			// assertion baked into the move sequence.
			await playMove(xPage, 1, "X");
			await waitForCellValue(oPage, 1, "X");

			await playMove(oPage, 4, "O");
			await waitForCellValue(xPage, 4, "O");

			await playMove(xPage, 2, "X");
			await waitForCellValue(oPage, 2, "X");

			await playMove(oPage, 5, "O");
			await waitForCellValue(xPage, 5, "O");

			await playMove(xPage, 3, "X");
			await waitForCellValue(oPage, 3, "X");

			// End-of-game status — must be visible on BOTH sides.
			await expect(xPage.getByText("You won!")).toBeVisible({
				timeout: 10_000,
			});
			await expect(oPage.getByText("You lost")).toBeVisible({
				timeout: 10_000,
			});

			// Final Passmark assertion: a human-grade summary on each side.
			await Promise.all([
				runLumeSteps({
					page: xPage,
					test,
					expect,
					userFlow: "X player sees the win state",
					steps: [],
					assertions: [
						{
							assertion:
								"The Tic Tac Toe board shows a completed game where X has three marks in the top row, the status reads 'You won!', and a 'Rematch' button is visible.",
						},
					],
				}),
				runLumeSteps({
					page: oPage,
					test,
					expect,
					userFlow: "O player sees the loss state",
					steps: [],
					assertions: [
						{
							assertion:
								"The Tic Tac Toe board shows a completed game where the opponent (X) has three marks in the top row, the status reads 'You lost', and a 'Rematch' button is visible.",
						},
					],
				}),
			]);
		} finally {
			await aliceContext.close();
			await bobContext.close();
		}
	});
});

// ---------------------------------------------------------------------------
// helpers (private to this spec)
// ---------------------------------------------------------------------------

/** Locate a TTT cell by its 1-indexed position via the aria-label prefix. */
function cellLocator(page: Page, position1Indexed: number) {
	return page.getByLabel(new RegExp(`^Cell ${position1Indexed}(,|$)`));
}

/** Click a cell from the perspective of the player whose turn it is. */
async function playMove(page: Page, position1Indexed: number, mark: "X" | "O") {
	await expect(page.getByText("Your turn")).toBeVisible({ timeout: 10_000 });
	await cellLocator(page, position1Indexed).click();
	// Confirm the mark rendered on the local board before we move on.
	await expect(cellLocator(page, position1Indexed)).toHaveAccessibleName(
		new RegExp(`^Cell ${position1Indexed}, ${mark}`),
		{ timeout: 5_000 },
	);
}

/** Wait for a cell to reach a given value on the opponent's board. */
async function waitForCellValue(
	page: Page,
	position1Indexed: number,
	value: "X" | "O",
) {
	await expect(cellLocator(page, position1Indexed)).toHaveAccessibleName(
		new RegExp(`^Cell ${position1Indexed}, ${value}`),
		{ timeout: 10_000 },
	);
}

/**
 * The matchmaker decides which user is X (seat `user_a`), so we discover
 * it by reading whichever board shows "Your turn" first. The other page
 * must show "Opponent's turn".
 */
async function detectSeats(alicePage: Page, bobPage: Page) {
	const aliceFirst = await alicePage
		.getByText("Your turn")
		.isVisible()
		.catch(() => false);
	if (aliceFirst) {
		return { x: alicePage, o: bobPage, xName: "Alice" } as const;
	}
	await expect(bobPage.getByText("Your turn")).toBeVisible({ timeout: 10_000 });
	return { x: bobPage, o: alicePage, xName: "Bob" } as const;
}
