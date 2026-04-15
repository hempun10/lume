import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/features/landing";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [
			{
				title: "Lume — Meet New People Through Chat & Games",
			},
			{
				name: "description",
				content:
					"Lume connects you with real people worldwide for spontaneous text chats and multiplayer games. Free, safe, and instant. The modern alternative to Omegle.",
			},
		],
	}),
	component: HomePage,
});

function HomePage() {
	return <LandingPage />;
}
