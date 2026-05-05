import { expect, test } from "@playwright/test";
import { runSteps } from "passmark";
import { BASE_URL, uniqueEmail } from "./helpers";

const SUPABASE_URL =
	process.env.VITE_SUPABASE_URL ?? "http://127.0.0.1:54321";
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? "";

test.describe("Auth recovery (email OTP)", () => {
	test("user can reset password via the 6-digit OTP from the recovery email", async ({
		page,
	}, testInfo) => {
		testInfo.setTimeout(240_000);

		const email = uniqueEmail("recovery");
		const oldPassword = "password123";
		const newPassword = `new-${Math.random().toString(36).slice(2, 10)}`;

		// 1. Create a Supabase auth user via the REST API. Going through the UI
		//    would auto-sign-in and bounce us to /onboarding, which isn't what
		//    we want to exercise here.
		const signUpRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
			method: "POST",
			headers: { apikey: ANON_KEY, "Content-Type": "application/json" },
			body: JSON.stringify({ email, password: oldPassword }),
		});
		expect(signUpRes.ok).toBeTruthy();

		// 2. Request a recovery code from the forgot-password page.
		await page.goto(`${BASE_URL}/forgot-password`);
		await page.waitForTimeout(3_000);
		await page.getByLabel("Email").fill(email);
		await page.getByRole("button", { name: "Send code" }).click();

		// Forgot-password mutation redirects to /reset-password with the email
		// in search params.
		await expect(page).toHaveURL(/\/reset-password\?email=/, {
			timeout: 10_000,
		});
		await expect(page.getByText(email)).toBeVisible();

		// 3. Hand off to Passmark: pull the OTP from Mailpit (via our custom
		//    email provider in playwright.config.ts) and complete the form.
		await runSteps({
			page,
			test,
			userFlow: "Reset password using the OTP from the recovery email",
			steps: [
				{
					description:
						"Fill the 'Verification code' field with the 6-digit code from the recovery email",
					data: {
						value: `{{email.otp:get the 6 digit verification code:${email}}}`,
					},
				},
				{
					description: "Fill the 'New password' field",
					data: { value: newPassword },
				},
				{
					description: "Fill the 'Confirm new password' field",
					data: { value: newPassword },
				},
				{
					description: "Click the 'Update password' button",
				},
			],
			// We don't add a Passmark assertion or `waitUntil` here: the page
			// auto-redirects to /dashboard a few seconds after success, and a
			// snapshot-based AI check can't reliably observe the brief alert. The
			// Playwright assertion below (URL leaves /reset-password) is the
			// proof-of-success.
		});

		// 4. The page auto-navigates after success — wait until we're off
		//    /reset-password.
		await expect(page).not.toHaveURL(/\/reset-password/, { timeout: 10_000 });

		// 5. Deterministic backstop: clear session and verify the NEW password
		//    actually works for sign-in (and the old one no longer does).
		//    Supabase persists sessions in localStorage, so we must clear that too.
		await page.context().clearCookies();
		await page.evaluate(() => {
			window.localStorage.clear();
			window.sessionStorage.clear();
		});
		await page.goto(`${BASE_URL}/login`);
		await page.waitForTimeout(3_000);
		await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });

		// Old password must fail — form re-renders an error and stays on /login.
		await page.getByLabel("Email").fill(email);
		await page.getByLabel("Password").fill(oldPassword);
		await page.getByRole("button", { name: "Sign in" }).click();
		await page.waitForTimeout(2_000);
		await expect(page).toHaveURL(/\/login/);

		// New password must succeed.
		await page.getByLabel("Email").fill(email);
		await page.getByLabel("Password").fill(newPassword);
		await page.getByRole("button", { name: "Sign in" }).click();
		// Either /dashboard (if onboarding existed) or /onboarding (fresh user).
		await expect(page).toHaveURL(/\/(dashboard|onboarding)/, {
			timeout: 20_000,
		});
	});
});
