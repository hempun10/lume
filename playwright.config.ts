import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { configure } from "passmark";
import { mailpitProvider } from "./e2e/passmark/mailpit-provider";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(dirname, ".env");
dotenv.config({ path: envPath, quiet: true });

configure({
	ai: {
		gateway: "openrouter",
		models: {
			stepExecution: "google/gemini-2.5-flash",
			userFlowLow: "google/gemini-2.5-flash",
			userFlowHigh: "google/gemini-2.5-flash",
			assertionPrimary: "google/gemini-2.5-flash",
			assertionSecondary: "google/gemini-2.5-flash",
			assertionArbiter: "google/gemini-2.5-flash",
			utility: "google/gemini-2.5-flash",
		},
	},
	// Mailpit (built into `supabase start`) catches every email Supabase Auth
	// sends locally. Passmark uses this provider to pull the 6-digit OTP from
	// the recovery email during the forgot-password test.
	email: mailpitProvider(),
});

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
	testDir: "./e2e/passmark",
	testMatch: /.*\.spec\.ts/,
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: 1,
	timeout: 90_000,
	expect: {
		timeout: 10_000,
	},
	reporter: process.env.CI
		? [["github"], ["html", { open: "never" }]]
		: [["list"], ["html", { open: "never" }]],
	use: {
		baseURL,
		headless: process.env.PLAYWRIGHT_HEADLESS !== "0",
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
		video: "retain-on-failure",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "mobile-chrome",
			use: { ...devices["Pixel 7"] },
		},
	],
});
