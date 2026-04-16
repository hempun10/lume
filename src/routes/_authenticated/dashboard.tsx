import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/features/auth";
import { LobbyView } from "@/features/lobby";
import type { MatchMode } from "@/features/lobby/types";

interface DashboardSearchParams {
	mode?: MatchMode;
}

export const Route = createFileRoute("/_authenticated/dashboard")({
	validateSearch: (search: Record<string, unknown>): DashboardSearchParams => ({
		mode:
			search.mode === "text" || search.mode === "games"
				? search.mode
				: undefined,
	}),
	head: () => ({
		meta: [{ title: "Lobby | Lume" }, { name: "robots", content: "noindex" }],
	}),
	component: DashboardPage,
});

function DashboardPage() {
	const { user } = useAuth();
	const { mode } = Route.useSearch();
	const displayName =
		(user?.user_metadata?.display_name as string) ?? user?.email ?? "Stranger";
	return <LobbyView displayName={displayName} initialMode={mode} />;
}
