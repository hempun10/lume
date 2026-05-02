import { expect, test } from "@playwright/test";
import { loginAsSeededUser, runLumeSteps, SEEDED_USERS } from "./helpers";

test.describe("Realtime matchmaking", () => {
	test.skip(
		process.env.RUN_REALTIME_PASSMARK !== "1",
		"Set RUN_REALTIME_PASSMARK=1 when local Supabase realtime, pg_cron, and edge functions are running.",
	);

	test("two seeded users can match and exchange a message", async ({ browser }) => {
		const aliceContext = await browser.newContext();
		const bobContext = await browser.newContext();
		const alicePage = await aliceContext.newPage();
		const bobPage = await bobContext.newPage();

		try {
			await loginAsSeededUser({ page: alicePage, user: SEEDED_USERS.alice });
			await loginAsSeededUser({ page: bobPage, user: SEEDED_USERS.bob });

			await Promise.all([
				runLumeSteps({
					page: alicePage,
					test,
					expect,
					userFlow: "Alice starts realtime matching",
					steps: [
						{ description: "Click Start matching", waitUntil: "Alice reaches a chat room" },
					],
					assertions: [{ assertion: "Alice is in a Lume chat room." }],
				}),
				runLumeSteps({
					page: bobPage,
					test,
					expect,
					userFlow: "Bob starts realtime matching",
					steps: [
						{ description: "Click Start matching", waitUntil: "Bob reaches a chat room" },
					],
					assertions: [{ assertion: "Bob is in a Lume chat room." }],
				}),
			]);

			await runLumeSteps({
				page: alicePage,
				test,
				expect,
				userFlow: "Alice sends a realtime chat message",
				steps: [
					{ description: "Send the message 'hello from passmark' in the chat input" },
				],
				assertions: [{ assertion: "Alice can see the sent message in the chat timeline." }],
			});

			await runLumeSteps({
				page: bobPage,
				test,
				expect,
				userFlow: "Bob receives a realtime chat message",
				steps: [{ description: "Look at the chat timeline" }],
				assertions: [{ assertion: "Bob can see the message 'hello from passmark' from Alice." }],
			});
		} finally {
			await aliceContext.close();
			await bobContext.close();
		}
	});
});
