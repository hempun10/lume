import { expect, test } from "@playwright/test";
import { BASE_URL, loginAsSeededUser, runLumeSteps } from "./helpers";

/**
 * Landing-page interaction coverage. The other landing spec covers routing
 * into auth and the trust pages; this one drills into the polish layer:
 * anchor nav, theme toggle, FAQ accordion, session-aware CTA, footer links,
 * and theme-aware imagery.
 */
test.describe("Landing page interactions", () => {
	test("header nav scrolls to the Features section", async ({ page }) => {
		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Use the landing header to jump to the Features section",
			steps: [
				{ description: `Navigate to ${BASE_URL}/` },
				{
					description: "Click the 'Features' link in the page header",
					waitUntil: "The Features section is scrolled into view",
				},
			],
			assertions: [
				{
					assertion:
						"The Features section is visible on screen, showing the 'Real conversations, with a stranger, right now' heading and the Text Chat block.",
				},
			],
		});
	});

	test("header nav scrolls to the How it works section", async ({ page }) => {
		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Use the landing header to jump to How it works",
			steps: [
				{ description: `Navigate to ${BASE_URL}/` },
				{
					description: "Click the 'How it works' link in the page header",
					waitUntil: "The How it works section is scrolled into view",
				},
			],
			assertions: [
				{
					assertion:
						"The How it works section is visible on screen, showing the numbered steps Sign up, Pick a vibe, and Chat and play.",
				},
			],
		});
	});

	test("header nav scrolls to the FAQ section", async ({ page }) => {
		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Use the landing header to jump to the FAQ",
			steps: [
				{ description: `Navigate to ${BASE_URL}/` },
				{
					description: "Click the 'FAQ' link in the page header",
					waitUntil: "The FAQ section is scrolled into view",
				},
			],
			assertions: [
				{
					assertion:
						"The Frequently asked questions heading is visible along with at least one question such as 'Is Lume really free?'.",
				},
			],
		});
	});

	test("theme toggle switches the page from light to dark mode", async ({
		page,
	}) => {
		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Toggle the landing page theme to dark mode",
			steps: [
				{ description: `Navigate to ${BASE_URL}/` },
				{
					description:
						"Click the theme toggle button in the header (its label is 'Switch to dark mode' or 'Switch to light mode')",
					waitUntil: "The page repaints in the opposite theme",
				},
			],
			assertions: [
				{
					assertion:
						"The landing page is now rendered in dark mode: the page background is dark and the foreground text is light.",
				},
			],
		});

		// Deterministic verification too: the <html> class should have flipped.
		const htmlClass = await page.locator("html").getAttribute("class");
		expect(htmlClass ?? "").toContain("dark");
	});

	test("FAQ accordion reveals an answer when a question is clicked", async ({
		page,
	}) => {
		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Open a FAQ entry on the landing page",
			steps: [
				{ description: `Navigate to ${BASE_URL}/#faq` },
				{
					description:
						"Click the 'Is Lume really free?' question in the FAQ list",
					waitUntil: "The matching answer expands below the question",
				},
			],
			assertions: [
				{
					assertion:
						"The answer for 'Is Lume really free?' is now visible directly below the question (not collapsed/hidden), describing that Lume is free to use.",
				},
			],
		});
	});

	test("header CTA reads 'Sign In' for an anonymous visitor", async ({
		page,
	}, testInfo) => {
		testInfo.skip(
			testInfo.project.name === "mobile-chrome",
			"Mobile header collapses the CTA into a hamburger sheet — covered on desktop.",
		);
		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Visit the landing page without logging in",
			steps: [{ description: `Navigate to ${BASE_URL}/` }],
			assertions: [
				{
					assertion:
						"The landing header shows a 'Sign In' button on the right (it does not show 'Open App' or 'Dashboard').",
				},
			],
		});
	});

	test("header CTA changes to 'Open App' for an authenticated visitor", async ({
		page,
	}, testInfo) => {
		testInfo.skip(
			testInfo.project.name === "mobile-chrome",
			"Mobile header collapses the CTA into a hamburger sheet — covered on desktop.",
		);
		// Deterministic login keeps this test cheap and stable; Passmark only
		// inspects the resulting header.
		await loginAsSeededUser({ page });
		await page.goto(`${BASE_URL}/`);

		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Visit the landing page while logged in as Alice",
			steps: [
				{
					description:
						"Confirm the landing page is loaded with the Lume hero visible",
				},
			],
			assertions: [
				{
					assertion:
						"The landing header shows an 'Open App' button on the right (it does not show 'Sign In').",
				},
			],
		});
	});

	test("footer Privacy link routes to the Privacy page", async ({ page }) => {
		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Use the landing footer to reach the Privacy page",
			steps: [
				{ description: `Navigate to ${BASE_URL}/` },
				{
					description: "Scroll to the bottom of the page to reveal the footer",
				},
				{
					description: "Click the 'Privacy' link in the footer Company column",
					waitUntil: "The Privacy page replaces the landing page",
				},
			],
			assertions: [
				{
					assertion:
						"The Privacy page is now displayed with privacy-policy content (not a 404 or error page).",
				},
			],
		});
	});

	test("footer Terms link routes to the Terms page", async ({ page }) => {
		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Use the landing footer to reach the Terms page",
			steps: [
				{ description: `Navigate to ${BASE_URL}/` },
				{
					description: "Scroll to the bottom of the page to reveal the footer",
				},
				{
					description: "Click the 'Terms' link in the footer Company column",
					waitUntil: "The Terms page replaces the landing page",
				},
			],
			assertions: [
				{
					assertion:
						"The Terms page is now displayed with terms-of-service content (not a 404 or error page).",
				},
			],
		});
	});

	test("hero preview image swaps to the dark variant when dark mode is on", async ({
		page,
	}) => {
		await page.goto(`${BASE_URL}/`);
		await page.waitForLoadState("networkidle");

		const heroImg = page.getByAltText("Lume dashboard preview");
		await expect(heroImg).toBeVisible();
		await expect(heroImg).toHaveAttribute("src", /dashboard-light\.png$/);

		await page
			.getByRole("button", { name: /Switch to (dark|light) mode/ })
			.click();

		// The ThemedImage swaps on theme change; assert the src now points at the
		// dark variant. This is the deterministic counterpart to the Passmark
		// "page is in dark mode" check above.
		await expect(heroImg).toHaveAttribute("src", /dashboard-dark\.png$/, {
			timeout: 5_000,
		});
	});
});
