import { expect, test } from "@playwright/test";
import { BASE_URL, loginAsSeededUser, runLumeSteps } from "./helpers";

test.describe("Chat safety", () => {
	test.skip(
		process.env.RUN_REALTIME_PASSMARK !== "1",
		"Report flow needs a real matched room with a partner profile; enable alongside realtime Passmark runs.",
	);

	test("report dialog requires a reason before submission", async ({ page }) => {
		await loginAsSeededUser({ page });

		await runLumeSteps({
			page,
			test,
			expect,
			userFlow: "Open chat safety controls and verify report validation",
			steps: [
				{ description: `Navigate to ${BASE_URL}/chat?roomId=passmark-safety-room` },
				{ description: "Wait for the chat screen to load, even if the stranger is disconnected" },
				{ description: "Open the report or flag dialog from the chat header or ended-chat screen" },
				{ description: "Confirm the report dialog shows reason choices, notes, and an Also block option" },
				{ description: "Try to submit the report without choosing a reason" },
			],
			assertions: [
				{ assertion: "The report form prevents submission until a reason is selected and communicates that a reason is required." },
				{ assertion: "The safety UI includes an Also block option so users can silently avoid being rematched." },
			],
		});
	});
});
