import { createFileRoute } from "@tanstack/react-router";
import { GamesView } from "@/features/games/components/games-view";

export const Route = createFileRoute("/_authenticated/games")({
	head: () => ({
		meta: [{ title: "Games | Lume" }, { name: "robots", content: "noindex" }],
	}),
	component: GamesPage,
});

function GamesPage() {
	return <GamesView />;
}
