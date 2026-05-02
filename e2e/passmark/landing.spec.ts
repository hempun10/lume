import { expect, test } from "@playwright/test";
import { BASE_URL, runLumeSteps } from "./helpers";

test.describe("Public landing and trust pages", () => {
	test("landing page explains Lume and links into auth", async ({ page }) => {
		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Open the public Lume landing page and continue to sign in",
			timeout: 150_000,
			steps: [
				{ description: `Navigate to ${BASE_URL}/` },
				{ description: "Confirm the page shows the Lume brand and explains meeting strangers through chat or games" },
				{ description: "Click the Sign In navigation link or sign-in call to action", waitUntil: "The sign in page is visible" },
			],
			assertions: [
				{ assertion: "The login page is visible with Email, Password, and Sign in controls." },
			],
		});
	});

	test("terms page renders", async ({ page }) => {
		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Verify the public Terms page",
			steps: [
				{ description: `Navigate to ${BASE_URL}/terms` },
				{ description: "Confirm the Terms page loads and contains terms or service policy content" },
			],
			assertions: [
				{ assertion: "The Terms page rendered successfully without a not-found or error page." },
			],
		});
	});

	test("privacy page renders", async ({ page }) => {
		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Verify the public Privacy page",
			steps: [
				{ description: `Navigate to ${BASE_URL}/privacy` },
				{ description: "Confirm the Privacy page loads and contains privacy policy content" },
			],
			assertions: [
				{ assertion: "The Privacy page rendered successfully without a not-found or error page." },
			],
		});
	});

	test("community guidelines page renders", async ({ page }) => {
		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Verify the public Community Guidelines page",
			steps: [
				{ description: `Navigate to ${BASE_URL}/community-guidelines` },
				{ description: "Confirm the Community Guidelines page loads and contains safety guidance" },
			],
			assertions: [
				{ assertion: "The Community Guidelines page rendered successfully without a not-found or error page." },
			],
		});
	});
});
