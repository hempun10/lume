import { expect, test } from "@playwright/test";
import { runLumeSteps, signUpNewUser } from "./helpers";

test.describe("Signup and onboarding", () => {
	test("new user can create an account and reach onboarding", async ({ page }) => {
		await signUpNewUser(page);

		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Verify the post-signup onboarding screen",
			steps: [
				{ description: "Confirm the Complete your profile onboarding page is visible" },
				{ description: "Confirm the form asks for display name, date of birth, gender, interests, and Terms and Privacy consent" },
			],
			assertions: [
				{
					assertion:
						"A newly signed-up user is on onboarding and cannot proceed without completing profile and consent fields.",
				},
			],
		});
	});

	test("onboarding blocks an incomplete profile submission", async ({ page }) => {
		await signUpNewUser(page);

		await page.getByRole("button", { name: "Start exploring Lume" }).click();

		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Verify onboarding validation",
			steps: [
				{ description: "Review the validation messages shown after attempting to submit the empty onboarding form" },
			],
			assertions: [
				{
					assertion:
						"The user remains on onboarding and sees clear validation feedback for required profile fields or consent.",
				},
			],
		});
	});

	test("date-of-birth picker disables under-18 dates so the 18+ rule cannot be bypassed", async ({
		page,
	}) => {
		await signUpNewUser(page);

		// Open the calendar popover.
		await page.getByRole("button", { name: /Pick a date/ }).click();

		// Calendar uses captionLayout="dropdown" with endMonth=MAX_DOB (today minus
		// 18 years). The year dropdown therefore must NOT contain the current year,
		// and its largest option is the current-year minus 18.
		const currentYear = new Date().getFullYear();
		const maxAllowedYear = currentYear - 18;

		const yearDropdown = page
			.getByRole("combobox")
			.filter({ hasText: String(maxAllowedYear) })
			.first();
		await expect(yearDropdown).toBeVisible({ timeout: 5_000 });

		const yearOptions = await yearDropdown
			.locator("option")
			.evaluateAll((opts) =>
				opts
					.map((o) => Number((o as HTMLOptionElement).value))
					.filter((n) => Number.isFinite(n)),
			);

		expect(yearOptions.length).toBeGreaterThan(0);
		const maxYear = Math.max(...yearOptions);
		expect(maxYear).toBeLessThanOrEqual(maxAllowedYear);
		expect(yearOptions).not.toContain(currentYear);
	});
});
