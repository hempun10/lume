import { expect, test } from "@playwright/test";
import { loginAsSeededUser, runLumeSteps, SEEDED_USERS } from "./helpers";

/**
 * Two-browser realtime regression.
 *
 * Alice and Bob are seeded with two overlapping interests (Music, Cooking)
 * and two non-overlapping ones, so the matchmaker's interest-overlap signal
 * is actually exercised — not the no-candidate fallback. Once they land in
 * the same room, the chat shows a `<SharedInterestsBanner />` strip reading
 * "You both like Music · Cooking", which is a visible regression target for
 * Passmark.
 *
 * Gated behind RUN_REALTIME_PASSMARK=1 because realtime needs `supabase
 * start` healthy (channels, pg_cron, edge function for matching).
 */
test.describe("Realtime matchmaking", () => {
	test.skip(
		process.env.RUN_REALTIME_PASSMARK !== "1",
		"Set RUN_REALTIME_PASSMARK=1 when local Supabase realtime, pg_cron, and edge functions are running.",
	);

	test("two seeded users with shared interests match, see the overlap, and exchange a message", async ({
		browser,
	}, testInfo) => {
		testInfo.setTimeout(180_000);

		const aliceContext = await browser.newContext();
		const bobContext = await browser.newContext();
		const alicePage = await aliceContext.newPage();
		const bobPage = await bobContext.newPage();

		try {
			await loginAsSeededUser({ page: alicePage, user: SEEDED_USERS.alice });
			await loginAsSeededUser({ page: bobPage, user: SEEDED_USERS.bob });

			// Both users start matching in parallel — interest overlap (Music,
			// Cooking) makes them the highest-scoring candidate for each other.
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
					assertions: [
						{
							assertion:
								"Alice is in a Lume chat room: a stranger online indicator and a chat input are visible.",
						},
					],
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
					assertions: [
						{
							assertion:
								"Bob is in a Lume chat room: a stranger online indicator and a chat input are visible.",
						},
					],
				}),
			]);

			// Both rooms must surface the shared-interest reason for the pairing.
			// We assert it on each side so a regression on one client (e.g. the
			// stranger-profile fetch failing) is caught.
			await Promise.all([
				runLumeSteps({
					page: alicePage,
					test,
					expect,
					userFlow: "Alice sees the shared-interests banner",
					steps: [],
					assertions: [
						{
							assertion:
								"A 'You both like' banner is visible directly under the chat header, and it includes BOTH the words 'Music' AND 'Cooking' (these are the two interests Alice and Bob share).",
						},
					],
				}),
				runLumeSteps({
					page: bobPage,
					test,
					expect,
					userFlow: "Bob sees the shared-interests banner",
					steps: [],
					assertions: [
						{
							assertion:
								"A 'You both like' banner is visible directly under the chat header, and it includes BOTH the words 'Music' AND 'Cooking'.",
						},
					],
				}),
			]);

			// Sanity check: a non-overlapping interest must not appear on the
			// banner. (Alice has Travel/Photography; Bob has Anime/Fitness.)
			await runLumeSteps({
				page: alicePage,
				test,
				expect,
				userFlow: "Shared-interests banner excludes non-overlap",
				steps: [],
				assertions: [
					{
						assertion:
							"The 'You both like' banner does NOT mention 'Travel', 'Photography', 'Anime', or 'Fitness' — only the shared interests are listed.",
					},
				],
			});

			// Realtime delivery still works.
			await runLumeSteps({
				page: alicePage,
				test,
				expect,
				userFlow: "Alice sends a realtime chat message",
				steps: [
					{
						description:
							"Type 'hello from passmark' into the chat input and press Enter",
						waitUntil:
							"The message 'hello from passmark' appears in Alice's own chat timeline",
					},
				],
				assertions: [
					{
						assertion:
							"Alice's chat timeline contains a message that reads exactly 'hello from passmark'.",
					},
				],
			});

			await runLumeSteps({
				page: bobPage,
				test,
				expect,
				userFlow: "Bob receives a realtime chat message",
				steps: [],
				assertions: [
					{
						assertion:
							"Bob's chat timeline contains the incoming message 'hello from passmark' from the stranger.",
					},
				],
			});
		} finally {
			await aliceContext.close();
			await bobContext.close();
		}
	});
});
