import { createFileRoute, Navigate } from "@tanstack/react-router";
import { GameView } from "@/features/games";

interface GameSearchParams {
	roomId?: string;
}

export const Route = createFileRoute("/_authenticated/game")({
	validateSearch: (search: Record<string, unknown>): GameSearchParams => ({
		roomId:
			typeof search.roomId === "string" && search.roomId.length > 0
				? search.roomId
				: undefined,
	}),
	head: () => ({
		meta: [{ title: "Game | Lume" }, { name: "robots", content: "noindex" }],
	}),
	component: GamePage,
});

function GamePage() {
	const { roomId } = Route.useSearch();

	if (!roomId) {
		return <Navigate to="/games" />;
	}

	return <GameView roomId={roomId} />;
}
