import { expect, test, type Page } from "@playwright/test";
import { BASE_URL, loginAsSeededUser, runLumeSteps } from "./helpers";

/**
 * Snapshot the labels of every aria-pressed=true button on the page, then
 * click each by exact name. Avoids races where Playwright's dynamic locator
 * count moves faster than React's batched re-renders.
 */
async function deselectAllInterests(page: Page) {
	const labels = await page
		.locator('button[aria-pressed="true"]')
		.evaluateAll((els) =>
			els.map((el) => el.textContent?.trim() ?? "").filter(Boolean),
		);
	for (const label of labels) {
		await page.getByRole("button", { name: new RegExp(`^${label}$`) }).click();
	}
	await expect(
		page.locator('button[aria-pressed="true"]'),
	).toHaveCount(0, { timeout: 5_000 });
}

/**
 * Settings round-trip coverage. Form submissions are deterministic Playwright
 * (we already trust labels + success copy); the cross-page reflection is the
 * Passmark-friendly part because it judges what the user actually sees back
 * on the lobby.
 */
test.describe("Settings", () => {
	test("profile updates save with a success toast", async ({ page }) => {
		await loginAsSeededUser({ page });

		await page.goto(`${BASE_URL}/settings`);
		await expect(
			page.getByRole("heading", { name: "Settings" }),
		).toBeVisible();

		await page.getByLabel("Display name").fill("Alice Passmark");
		await page.getByLabel("Region (optional)").fill("Passmark City");
		await page.getByRole("button", { name: "Save changes" }).click();

		await expect(
			page.getByText("Profile updated successfully."),
		).toBeVisible({ timeout: 10_000 });
	});

	test("preference interests save with a success toast", async ({ page }) => {
		await loginAsSeededUser({ page });

		await page.goto(`${BASE_URL}/settings`);
		await expect(
			page.getByRole("heading", { name: "Settings" }),
		).toBeVisible();

		// Make sure both Gaming and Music are selected so the test is idempotent
		// across reseeds and reruns.
		const gaming = page.getByRole("button", { name: /^Gaming$/ });
		const music = page.getByRole("button", { name: /^Music$/ });
		if ((await gaming.getAttribute("aria-pressed")) !== "true") {
			await gaming.click();
		}
		if ((await music.getAttribute("aria-pressed")) !== "true") {
			await music.click();
		}

		await page.getByRole("button", { name: "Save preferences" }).click();
		await expect(
			page.getByText("Preferences updated successfully."),
		).toBeVisible({ timeout: 10_000 });
	});

	test("settings updates are reflected on the lobby Your vibe card", async ({
		page,
	}) => {
		await loginAsSeededUser({ page });

		await page.goto(`${BASE_URL}/settings`);
		await expect(
			page.getByRole("heading", { name: "Settings" }),
		).toBeVisible();

		await page.getByLabel("Display name").fill("Alice Passmark");
		await page.getByLabel("Region (optional)").fill("Passmark City");
		await page.getByRole("button", { name: "Save changes" }).click();
		await expect(
			page.getByText("Profile updated successfully."),
		).toBeVisible({ timeout: 10_000 });

		// Reset interests to a known small set independent of whatever earlier
		// tests in this file (or previous runs) left behind: clear all pressed
		// chips, then select exactly Music + Gaming.
		await deselectAllInterests(page);
		await page.getByRole("button", { name: /^Music$/ }).click();
		await page.getByRole("button", { name: /^Gaming$/ }).click();

		await page.getByRole("button", { name: "Save preferences" }).click();
		await expect(
			page.getByText("Preferences updated successfully."),
		).toBeVisible({ timeout: 10_000 });

		await page.goto(`${BASE_URL}/dashboard`);

		// YourVibeCard is at the bottom of the lobby — scroll it into view so it
		// appears in Passmark's snapshot.
		await page
			.getByRole("link", { name: "Edit your profile" })
			.scrollIntoViewIfNeeded();
		await expect(page.getByText("Showing as Alice Passmark")).toBeVisible();

		await runLumeSteps({
			page,
			test,
			expect,
			userFlow:
				"Confirm the lobby reflects the profile and interest changes saved in Settings",
			steps: [
				{
					description:
						"Confirm the dashboard lobby is loaded and the 'Your vibe' card is visible",
				},
			],
			assertions: [
				{
					assertion:
						"The lobby 'Your vibe' card shows the updated profile: it says 'Showing as Alice Passmark', the region 'Passmark City' is visible, and exactly two interest badges are present on the card: 'Music' and 'Gaming'.",
				},
			],
		});
	});

	test("profile updates persist after a hard reload", async ({ page }) => {
		await loginAsSeededUser({ page });

		await page.goto(`${BASE_URL}/settings`);
		await page.getByLabel("Display name").fill("Alice Persisted");
		await page.getByLabel("Region (optional)").fill("Reload City");
		await page.getByRole("button", { name: "Save changes" }).click();
		await expect(
			page.getByText("Profile updated successfully."),
		).toBeVisible({ timeout: 10_000 });

		await page.reload();
		await expect(
			page.getByRole("heading", { name: "Settings" }),
		).toBeVisible();

		// The form should rehydrate with the values we just saved, not reset to
		// the previous profile state.
		await expect(page.getByLabel("Display name")).toHaveValue(
			"Alice Persisted",
		);
		await expect(page.getByLabel("Region (optional)")).toHaveValue(
			"Reload City",
		);
	});

	test("preference interest selector enforces an 8-interest cap", async ({
		page,
	}) => {
		await loginAsSeededUser({ page });

		await page.goto(`${BASE_URL}/settings`);
		await expect(
			page.getByRole("heading", { name: "Settings" }),
		).toBeVisible();

		// Reset to a clean slate. There's only one InterestTagSelector on /settings
		// (in the preferences card), so an unscoped query is unambiguous.
		await deselectAllInterests(page);

		// Select exactly 8 interests — the schema/UI cap.
		const eight = [
			"Music",
			"Travel",
			"Photography",
			"Cooking",
			"Gaming",
			"Technology",
			"Anime",
			"Fitness",
		];
		for (const name of eight) {
			await page
				.getByRole("button", { name: new RegExp(`^${name}$`) })
				.click();
		}

		// A 9th chip should now be disabled (atMax branch in InterestTagSelector).
		const ninth = page.getByRole("button", { name: /^Movies$/ });
		await expect(ninth).toBeDisabled();
		await expect(ninth).toHaveAttribute("aria-pressed", "false");

		// Saving with exactly 8 still works.
		await page.getByRole("button", { name: "Save preferences" }).click();
		await expect(
			page.getByText("Preferences updated successfully."),
		).toBeVisible({ timeout: 10_000 });
	});

	test("Save preferences is disabled when no interests are selected", async ({
		page,
	}) => {
		await loginAsSeededUser({ page });

		await page.goto(`${BASE_URL}/settings`);
		await expect(
			page.getByRole("heading", { name: "Settings" }),
		).toBeVisible();

		// Deselect every chip on the page — settings only renders interest chips
		// in the preferences card, so this cannot affect anything else.
		await deselectAllInterests(page);

		await expect(
			page.getByRole("button", { name: "Save preferences" }),
		).toBeDisabled();
	});
});
