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
});
