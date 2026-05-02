import { expect, test } from "@playwright/test";
import { BASE_URL, runLumeSteps, SEEDED_USERS } from "./helpers";

test.describe("Authentication and route guards", () => {
	test("protected routes redirect signed-out visitors to login", async ({ page }) => {
		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Verify signed-out route protection",
			steps: [
				{ description: `Navigate to ${BASE_URL}/dashboard`, waitUntil: "The sign in page is visible" },
				{ description: `Navigate to ${BASE_URL}/settings`, waitUntil: "The sign in page is visible" },
				{ description: `Navigate to ${BASE_URL}/games`, waitUntil: "The sign in page is visible" },
				{ description: `Navigate to ${BASE_URL}/chat?roomId=passmark-room`, waitUntil: "The sign in page is visible" },
			],
			assertions: [
				{ assertion: "A signed-out visitor cannot access protected dashboard, settings, games, or chat pages and is asked to sign in." },
			],
		});
	});

	test("invalid credentials show an inline auth error", async ({ page }) => {
		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Reject invalid login",
			steps: [
				{ description: `Navigate to ${BASE_URL}/login` },
				{ description: "Fill the Email field", data: { value: SEEDED_USERS.alice.email } },
				{ description: "Fill the Password field", data: { value: "definitely-wrong-password" } },
				{ description: "Click Sign in", waitUntil: "An invalid login error is visible" },
			],
			assertions: [
				{ assertion: "The user remains on the sign in page and sees a clear error for invalid credentials." },
			],
		});
	});
});
