import { expect, test } from "@playwright/test";
import {
	BASE_URL,
	loginAsSeededUser,
	runLumeSteps,
	SEEDED_USERS,
} from "./helpers";

/**
 * End-to-end coverage for the auth lifecycle that other specs only touch
 * indirectly: a successful login, a logout, a duplicate-email signup attempt,
 * and the two `beforeLoad` redirects that bounce already-authenticated users
 * away from /login and /signup.
 */
test.describe("Auth flows", () => {
	test("valid credentials log the user into the dashboard", async ({
		page,
	}) => {
		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Sign in with seeded user Alice and reach the dashboard",
			steps: [
				{ description: `Navigate to ${BASE_URL}/login` },
				{
					description: "Fill the Email field",
					data: { value: SEEDED_USERS.alice.email },
				},
				{
					description: "Fill the Password field",
					data: { value: SEEDED_USERS.alice.password },
				},
				{
					description: "Click the Sign in button",
					waitUntil: "The dashboard/lobby is visible",
				},
			],
			assertions: [
				{
					assertion:
						"After signing in, Alice is on the dashboard/lobby with a 'Start matching' button visible — not still on the login form.",
				},
			],
		});
	});

	test("logging out clears the session and returns to a public page", async ({
		page,
	}) => {
		// Deterministic login: not the behavior under test.
		await loginAsSeededUser({ page });

		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Log out from the dashboard account menu",
			steps: [
				{
					description:
						"Click the account avatar button in the top right (its accessible label is 'Open account menu')",
					waitUntil: "The account dropdown menu is visible",
				},
				{
					description: "Click the 'Log out' menu item",
					waitUntil: "The user is signed out and returned to a public page",
				},
			],
			assertions: [
				{
					assertion:
						"The user is no longer on the dashboard. They are on a public page (landing or login) and the 'Start matching' lobby button is no longer visible.",
				},
			],
		});

		// Deterministic confirmation: hitting a protected route should now bounce
		// back to login instead of rendering the dashboard.
		await page.goto(`${BASE_URL}/dashboard`);
		await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
	});

	test("signing up with an already-registered email shows an error", async ({
		page,
	}) => {
		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Attempt to sign up with an email that already exists",
			steps: [
				{ description: `Navigate to ${BASE_URL}/signup` },
				{
					description: "Fill the Email field with a known existing user's email",
					data: { value: SEEDED_USERS.alice.email },
				},
				{
					description: "Fill the Password field",
					data: { value: "password123" },
				},
				{
					description: "Click the Create account button",
					waitUntil:
						"A signup error is visible explaining the email is already in use",
				},
			],
			assertions: [
				{
					assertion:
						"The signup form remains visible and shows an error message indicating the email is already registered or the user already exists. The user is NOT taken to the onboarding screen.",
				},
			],
		});
	});

	test("authenticated visitor on /login is redirected to /dashboard", async ({
		page,
	}) => {
		// Deterministic — the redirect logic lives in `src/routes/login.tsx`
		// `beforeLoad`, so we just need a signed-in session and a goto.
		await loginAsSeededUser({ page });

		await page.goto(`${BASE_URL}/login`);
		await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
		await expect(
			page.getByRole("button", { name: "Start matching" }),
		).toBeVisible({ timeout: 10_000 });
	});

	test("authenticated visitor on /signup is redirected to /dashboard", async ({
		page,
	}) => {
		await loginAsSeededUser({ page });

		await page.goto(`${BASE_URL}/signup`);
		await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
		await expect(
			page.getByRole("button", { name: "Start matching" }),
		).toBeVisible({ timeout: 10_000 });
	});
});
