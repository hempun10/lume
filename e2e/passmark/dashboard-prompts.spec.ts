import { expect, test } from "@playwright/test";
import { loginAsSeededUser } from "./helpers";

/**
 * "Break the ice" prompt-preview card on the lobby. Two behaviors:
 *   - Shuffle button regenerates the three prompt cards
 *   - Per-prompt Copy button writes the text to the system clipboard
 *
 * Both are verified deterministically (no Passmark cost) — clipboard reads
 * and DOM text comparison are exact, no reason to spend AI calls here.
 */
test.describe("Lobby prompts (Break the ice)", () => {
	test("Shuffle button regenerates the prompt cards", async ({ page }) => {
		await loginAsSeededUser({ page });

		// Each prompt card uses an aria-label of "Copy prompt: <prompt text>".
		// We grab those labels as a stable representation of what's currently
		// rendered, then click Shuffle and assert the set changed.
		const copyButtons = page.getByRole("button", { name: /^Copy prompt:/ });
		await expect(copyButtons).toHaveCount(3);

		const before = (await copyButtons.evaluateAll((els) =>
			els.map((el) => el.getAttribute("aria-label") ?? ""),
		)).sort();

		// Click Shuffle until the prompts change. With ~9 templates per interest
		// the very next click will almost always change the set, but loop a few
		// times to be robust to a same-set re-roll.
		const shuffle = page.getByRole("button", { name: "Shuffle prompts" });
		for (let attempt = 0; attempt < 5; attempt++) {
			await shuffle.click();
			const after = (await copyButtons.evaluateAll((els) =>
				els.map((el) => el.getAttribute("aria-label") ?? ""),
			)).sort();
			if (JSON.stringify(after) !== JSON.stringify(before)) {
				return; // success
			}
		}
		throw new Error("Shuffle did not change any of the three prompts after 5 attempts.");
	});

	test("Copy button writes the prompt to the clipboard", async ({
		page,
		context,
		browserName,
	}) => {
		// Clipboard read isn't reliable on WebKit/Firefox shims; chromium-only.
		test.skip(browserName !== "chromium", "Clipboard read requires chromium permissions.");

		await context.grantPermissions(["clipboard-read", "clipboard-write"]);
		await loginAsSeededUser({ page });

		const firstCopyBtn = page
			.getByRole("button", { name: /^Copy prompt:/ })
			.first();
		const ariaLabel = await firstCopyBtn.getAttribute("aria-label");
		expect(ariaLabel).toBeTruthy();
		// "Copy prompt: <text>" -> <text>
		const expectedPrompt = ariaLabel?.replace(/^Copy prompt:\s*/, "") ?? "";
		expect(expectedPrompt.length).toBeGreaterThan(0);

		await firstCopyBtn.click();

		// After click the button briefly switches to "Copied" — confirms UI feedback.
		await expect(
			page.getByRole("button", { name: "Copied" }).first(),
		).toBeVisible({ timeout: 2_000 });

		const clipboardText = await page.evaluate(() =>
			navigator.clipboard.readText(),
		);
		expect(clipboardText).toBe(expectedPrompt);
	});
});
