import { expect as playwrightExpect, type Expect, type Page } from "@playwright/test";
import { runSteps } from "passmark";
import type { test as baseTest } from "@playwright/test";

export const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

export const SEEDED_USERS = {
	alice: {
		email: "user-a@example.com",
		password: "password123",
		name: "Alice",
	},
	bob: {
		email: "user-b@example.com",
		password: "password123",
		name: "Bob",
	},
} as const;

type TestApi = typeof baseTest;

export function uniqueEmail(prefix = "passmark") {
	return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

export async function runLumeSteps({
	page,
	test,
	expect,
	userFlow,
	steps,
	assertions = [],
	timeout = 90_000,
}: {
	page: Page;
	test: TestApi;
	expect: Expect;
	userFlow: string;
	steps: Parameters<typeof runSteps>[0]["steps"];
	assertions?: NonNullable<Parameters<typeof runSteps>[0]["assertions"]>;
	timeout?: number;
}) {
	test.setTimeout(Math.max(test.info().timeout, timeout));
	await runSteps({
		page,
		test,
		expect,
		userFlow,
		steps,
		assertions,
	});
}

/**
 * Deterministic setup helper: logging in is not the behavior under test in most
 * specs, so do it with Playwright locators to save AI credits and reduce flake.
 */
export async function loginAsSeededUser({
	page,
	user = SEEDED_USERS.alice,
}: {
	page: Page;
	user?: (typeof SEEDED_USERS)[keyof typeof SEEDED_USERS];
}) {
	await page.goto(`${BASE_URL}/login`);
	await page.waitForTimeout(3000);
	await page.getByLabel("Email").fill(user.email);
	await page.getByLabel("Password").fill(user.password);
	await page.getByRole("button", { name: "Sign in" }).click();
	await playwrightExpect(
		page.getByRole("button", { name: "Start matching" }),
	).toBeVisible({ timeout: 20_000 });
}

export async function signUpNewUser(page: Page, email = uniqueEmail()) {
	await page.goto(`${BASE_URL}/signup`);
	await page.waitForTimeout(3000);
	await page.getByLabel("Email").fill(email);
	await page.getByLabel("Password").fill("password123");
	await page.getByRole("button", { name: "Create account" }).click();
	await playwrightExpect(
		page.getByRole("heading", { name: "Complete your profile" }),
	).toBeVisible({ timeout: 20_000 });
	return email;
}
