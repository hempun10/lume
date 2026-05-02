import { expect, test } from "@playwright/test";
import { BASE_URL, loginAsSeededUser, runLumeSteps } from "./helpers";

test.describe("Dashboard and settings", () => {
	test("seeded user can start and cancel a search", async ({ page }) => {
		await loginAsSeededUser({ page });

		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Start and cancel Lume matchmaking",
			steps: [
				{ description: "Confirm the lobby shows Start matching, interest chips, and the live online count" },
				{ description: "Click Start matching", waitUntil: "The Searching or Looking for someone view is visible" },
				{ description: "Click Cancel", waitUntil: "The Start matching button is visible again" },
			],
			assertions: [
				{
					assertion:
						"The lobby is visible and usable again with the Start matching button available.",
				},
			],
		});

		await expect(page.getByRole("button", { name: "Start matching" })).toBeVisible();
	});

	test("seeded user can update profile and preferences in settings", async ({ page }) => {
		await loginAsSeededUser({ page });

		await page.goto(`${BASE_URL}/settings`);
		await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

		await page.getByLabel("Display name").fill("Alice Passmark");
		await page.getByLabel("Region (optional)").fill("Passmark City");
		await page.getByRole("button", { name: "Save changes" }).click();
		await expect(page.getByText("Profile updated successfully.")).toBeVisible();

		const gaming = page.getByRole("button", { name: /^Gaming$/ });
		const music = page.getByRole("button", { name: /^Music$/ });
		if ((await gaming.getAttribute("aria-pressed")) !== "true") {
			await gaming.click();
		}
		if ((await music.getAttribute("aria-pressed")) !== "true") {
			await music.click();
		}
		await page.getByRole("button", { name: "Save preferences" }).click();
		await expect(page.getByText("Preferences updated successfully.")).toBeVisible();

		await page.goto(`${BASE_URL}/dashboard`);

		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Verify settings changes are reflected in the lobby",
			steps: [
				{ description: "Review the lobby greeting and profile preview after saving settings" },
			],
			assertions: [
				{
					assertion:
						"The dashboard reflects the updated profile name, region, or matching interests from settings.",
				},
			],
		});
	});
});
