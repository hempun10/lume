import { expect, test } from "@playwright/test";
import { loginAsSeededUser, runLumeSteps, SEEDED_USERS } from "./helpers";

/**
 * Lobby (post-login dashboard) coverage. Each test pins ONE behavior so a
 * Passmark failure points at exactly the part of the lobby that broke.
 *
 * Alice's seeded interests are ["Music", "Travel", "Photography", "Cooking"].
 * Tests rely on these being auto-loaded from her profile on the lobby.
 */
test.describe("Dashboard lobby", () => {
	test("lobby renders greeting, online count, vibe chips auto-selected from profile, and the matching CTA", async ({
		page,
	}) => {
		await loginAsSeededUser({ page });

		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Open the dashboard lobby as the seeded user Alice",
			steps: [{ description: "Confirm the dashboard lobby is rendered" }],
			assertions: [
				{
					assertion: `The lobby shows ALL of the following at the same time: a personalized greeting that includes the name '${SEEDED_USERS.alice.name}'; a numeric live online count next to the word 'online'; a 'What\u2019s the vibe?' section with selectable interest chips where Music, Travel, Photography, and Cooking are visibly pre-selected (filled/active state) because they came from Alice's onboarding profile; a separate 'Your vibe' card that says 'Showing as ${SEEDED_USERS.alice.name}' and lists those same interests as outlined badges; and a primary 'Start matching' button at the bottom.`,
				},
			],
		});

		// Deterministic backstop: the four onboarding interests really are
		// pressed/active on the hero card (catches a regression in profile->state
		// hydration even if Passmark misreads the visual).
		for (const interest of ["Music", "Travel", "Photography", "Cooking"]) {
			await expect(
				page.getByRole("button", { name: new RegExp(`^${interest}$`) }),
			).toHaveAttribute("aria-pressed", "true");
		}
	});

	test("vibe chips enforce the 5-interest cap", async ({ page }) => {
		await loginAsSeededUser({ page });

		// Make this test order-independent: deselect every currently-pressed
		// chip in the LobbyHeroCard so we start from a known empty state, then
		// fill exactly 5 and verify the 6th is disabled.
		const pressedLabels = await page
			.locator('button[aria-pressed="true"]')
			.evaluateAll((els) =>
				els.map((el) => el.textContent?.trim() ?? "").filter(Boolean),
			);
		for (const label of pressedLabels) {
			await page.getByRole("button", { name: new RegExp(`^${label}$`) }).click();
		}

		const five = ["Music", "Travel", "Photography", "Cooking", "Gaming"];
		for (const name of five) {
			await page.getByRole("button", { name: new RegExp(`^${name}$`) }).click();
		}

		for (const name of five) {
			await expect(
				page.getByRole("button", { name: new RegExp(`^${name}$`) }),
			).toHaveAttribute("aria-pressed", "true");
		}

		// Counter reads 5/5 and the 6th chip (Fitness) is disabled.
		await expect(page.getByText("5/5")).toBeVisible();
		const sixth = page.getByRole("button", { name: /^Fitness$/ });
		await expect(sixth).toBeDisabled();
		await expect(sixth).toHaveAttribute("aria-pressed", "false");
	});

	test("Start matching opens the Searching view with timer and selected interests, and Cancel returns to idle", async ({
		page,
	}) => {
		await loginAsSeededUser({ page });

		// Drive the transitions deterministically so each phase is verifiable;
		// Passmark only judges the final lobby state below.
		await page.getByRole("button", { name: "Start matching" }).click();

		// Searching view is up: MM:SS timer + Cancel button visible.
		const timer = page.getByText(/^\d{2}:\d{2}$/);
		await expect(timer).toBeVisible({ timeout: 10_000 });
		await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();

		await page.getByRole("button", { name: "Cancel" }).click();

		// Lobby returns.
		await expect(
			page.getByRole("button", { name: "Start matching" }),
		).toBeVisible({ timeout: 10_000 });

		await runLumeSteps({
			page,
			test,
			expect,
			userFlow:
				"Confirm cancelling matchmaking returns the user to the lobby cleanly",
			steps: [
				{ description: "Confirm the dashboard lobby is rendered" },
			],
			assertions: [
				{
					assertion:
						"After cancelling, the lobby is fully visible and interactive again: the 'Start matching' button is shown, the interest chips and 'Your vibe' card are present, and there is no Searching screen, error, or stuck loading state on the page.",
				},
			],
		});
	});

	test("switching the mode toggle from Text Chat to Games changes the CTA copy", async ({
		page,
	}) => {
		await loginAsSeededUser({ page });

		await expect(
			page.getByRole("button", { name: "Start matching" }),
		).toBeVisible();

		await runLumeSteps({
			page,
			test,
			expect,
			userFlow:
				"Switch the lobby match-mode toggle from Text Chat to Games and confirm the CTA changes",
			steps: [
				{
					description:
						"Click the 'Games' option in the match-mode toggle group at the top of the lobby (next to 'Text Chat')",
					waitUntil:
						"The Games tab becomes the selected mode and the primary call-to-action button under the interest chips changes its label",
				},
			],
			assertions: [
				{
					assertion:
						"After switching to Games mode, the primary lobby CTA now reads 'Browse games' instead of 'Start matching'. The 'Games' toggle is the selected/active option and 'Text Chat' is no longer selected.",
				},
			],
		});

		await expect(
			page.getByRole("button", { name: "Browse games" }),
		).toBeVisible();
	});

	test("the games rail 'View all' link routes to /games and disables coming-soon games", async ({
		page,
	}) => {
		await loginAsSeededUser({ page });

		await page.getByRole("button", { name: /View all/ }).first().click();
		await expect(page).toHaveURL(/\/games$/, { timeout: 10_000 });

		// Coming-soon entries are rendered as disabled buttons; available games
		// remain interactive. Word Chain and Chess are the two coming-soon games
		// per src/features/games/data/games.ts.
		await expect(
			page.getByRole("button", { name: /Word Chain/ }).first(),
		).toBeDisabled();
		await expect(
			page.getByRole("button", { name: /Chess/ }).first(),
		).toBeDisabled();

		// At least one available game exists and is enabled.
		await expect(
			page.getByRole("button", { name: /Tic Tac Toe/ }).first(),
		).toBeEnabled();
	});

	test("the Your vibe card 'Edit' link routes to /settings", async ({
		page,
	}) => {
		await loginAsSeededUser({ page });

		await page.getByRole("link", { name: "Edit your profile" }).click();
		await expect(page).toHaveURL(/\/settings$/, { timeout: 10_000 });
		await expect(
			page.getByRole("heading", { name: "Settings" }),
		).toBeVisible();
	});
});
