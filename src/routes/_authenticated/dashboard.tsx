import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/features/auth";
import { LobbyView } from "@/features/lobby";

export const Route = createFileRoute("/_authenticated/dashboard")({
	head: () => ({
		meta: [{ title: "Lobby | Lume" }, { name: "robots", content: "noindex" }],
	}),
	component: DashboardPage,
});

function DashboardPage() {
	const { user } = useAuth();
	const displayName =
		(user?.user_metadata?.display_name as string) ?? user?.email ?? "Stranger";
	return <LobbyView displayName={displayName} />;
}
