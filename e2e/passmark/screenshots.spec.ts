import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { loginAsSeededUser, SEEDED_USERS } from "./helpers";

/**
 * Marquee-screenshot runner for the Hashnode article + PR description.
 *
 * Not part of the regression suite. Gated behind RUN_SCREENSHOTS=1.
 * Outputs to docs/images/.
 *
 *   RUN_SCREENSHOTS=1 npx playwright test e2e/passmark/screenshots.spec.ts \
 *     --project=chromium --reporter=list
 */
test.describe("Hashnode screenshots", () => {
	test.skip(
		process.env.RUN_SCREENSHOTS !== "1",
		"Set RUN_SCREENSHOTS=1 to capture marquee screenshots.",
	);

	test.beforeAll(async () => {
		await mkdir("docs/images", { recursive: true });
	});

	test("forgot-password form", async ({ page }) => {
		await page.goto("/forgot-password", { waitUntil: "networkidle" });
		await page.waitForTimeout(800);
		await page.screenshot({
			path: "docs/images/forgot-password.png",
			fullPage: false,
		});
	});

	test("reset-password form (OTP) with prefilled email", async ({ page }) => {
		await page.goto("/reset-password?email=user-a%40example.com", {
			waitUntil: "networkidle",
		});
		await page.waitForTimeout(800);
		await page.screenshot({
			path: "docs/images/reset-password.png",
			fullPage: false,
		});
	});

	test("matched chat with shared-interests banner + TTT win state", async ({
		browser,
	}, testInfo) => {
		testInfo.setTimeout(180_000);
		const aliceContext = await browser.newContext({
			viewport: { width: 1280, height: 800 },
		});
		const bobContext = await browser.newContext({
			viewport: { width: 1280, height: 800 },
		});
		const alicePage = await aliceContext.newPage();
		const bobPage = await bobContext.newPage();

		try {
			await loginAsSeededUser({ page: alicePage, user: SEEDED_USERS.alice });
			await loginAsSeededUser({ page: bobPage, user: SEEDED_USERS.bob });

			await Promise.all([
				alicePage.getByRole("button", { name: /start matching/i }).click(),
				bobPage.getByRole("button", { name: /start matching/i }).click(),
			]);

			// Wait for the shared-interests banner to render on Alice's side.
			await expect(
				alicePage.getByTestId("shared-interests-banner"),
			).toBeVisible({ timeout: 30_000 });
			await alicePage.waitForTimeout(800);

			// Shot 1: chat with shared-interests banner (Alice).
			await alicePage.screenshot({
				path: "docs/images/shared-interests-banner.png",
				fullPage: false,
			});

			// Open game panel + pick TTT (Alice).
			await alicePage
				.getByRole("button", { name: /play a game/i })
				.first()
				.click();
			await alicePage
				.getByRole("button", { name: "Play" })
				.first()
				.click();

			// Bob accepts.
			await bobPage
				.getByRole("button", { name: /^play$/i })
				.last()
				.click({ timeout: 15_000 });

			await expect(alicePage.getByLabel(/^Cell 1/)).toBeVisible({
				timeout: 15_000,
			});
			await expect(bobPage.getByLabel(/^Cell 1/)).toBeVisible({
				timeout: 15_000,
			});

			// Detect X seat.
			const aliceFirst = await alicePage
				.getByText("Your turn")
				.isVisible()
				.catch(() => false);
			const xPage = aliceFirst ? alicePage : bobPage;
			const oPage = aliceFirst ? bobPage : alicePage;

			// Top-row win.
			const cellByPos = (page: typeof alicePage, n: number) =>
				page.getByLabel(new RegExp(`^Cell ${n}(,|$)`));

			await cellByPos(xPage, 1).click();
			await expect(cellByPos(oPage, 1)).toHaveAccessibleName(/X/);
			await cellByPos(oPage, 4).click();
			await expect(cellByPos(xPage, 4)).toHaveAccessibleName(/O/);
			await cellByPos(xPage, 2).click();
			await expect(cellByPos(oPage, 2)).toHaveAccessibleName(/X/);
			await cellByPos(oPage, 5).click();
			await expect(cellByPos(xPage, 5)).toHaveAccessibleName(/O/);
			await cellByPos(xPage, 3).click();

			await expect(xPage.getByText("You won!")).toBeVisible({
				timeout: 10_000,
			});
			await alicePage.waitForTimeout(500);

			// Shot 2: TTT win state (X side).
			await xPage.screenshot({
				path: "docs/images/ttt-win.png",
				fullPage: false,
			});
			// Shot 3: TTT loss state (O side) — same moment in time.
			await oPage.screenshot({
				path: "docs/images/ttt-loss.png",
				fullPage: false,
			});
		} finally {
			await aliceContext.close();
			await bobContext.close();
		}
	});
});
