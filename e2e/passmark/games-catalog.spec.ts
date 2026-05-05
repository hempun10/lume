import { expect, test } from "@playwright/test";
import { BASE_URL, loginAsSeededUser, runLumeSteps } from "./helpers";

test.describe("Games catalog", () => {
	test("available and coming-soon games are understandable", async ({ page }) => {
		await loginAsSeededUser({ page });
		await page.goto(`${BASE_URL}/games`);

		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Browse Lume games catalog",
			steps: [
				{ description: "Review the games catalog and identify available games and coming-soon games" },
			],
			assertions: [
				{
					assertion:
						"The catalog clearly shows playable games and marks Word Chain and Chess as coming soon or unavailable.",
				},
			],
		});

		await page.getByRole("button", { name: "Play Tic Tac Toe" }).click();
		await expect(
			page.getByRole("heading", { name: /Finding a Tic Tac Toe partner|Looking for someone/i }),
		).toBeVisible({ timeout: 10_000 });
		await page.getByRole("button", { name: "Cancel" }).click();
		await expect(page.getByRole("button", { name: "Start matching" })).toBeVisible();
	});
});
