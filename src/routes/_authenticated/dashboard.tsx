import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/features/auth";
import { setPendingGame } from "@/features/games/data/pending-game";
import { LobbyView } from "@/features/lobby";
import { profileDetailOptions } from "@/features/settings/queries";

interface DashboardSearch {
	play?: string;
}

export const Route = createFileRoute("/_authenticated/dashboard")({
	validateSearch: (search: Record<string, unknown>): DashboardSearch => ({
		play:
			typeof search.play === "string" && search.play.length > 0
				? search.play
				: undefined,
	}),
	head: () => ({
		meta: [{ title: "Lobby | Lume" }, { name: "robots", content: "noindex" }],
	}),
	component: DashboardPage,
});

function DashboardPage() {
	const { user } = useAuth();
	const { data: profile } = useSuspenseQuery(
		profileDetailOptions(user?.id ?? ""),
	);
	const { play } = Route.useSearch();
	const navigate = useNavigate();

	/**
	 * `?play=<gameId>` is a one-shot signal from the games catalog.
	 * Stash the intent into sessionStorage (where the matchmaking hook
	 * and chat view can see it) and immediately strip it from the URL
	 * so a refresh doesn't re-trigger the auto-match.
	 */
	useEffect(() => {
		if (!play) return;
		setPendingGame(play);
		navigate({ to: "/dashboard", search: {}, replace: true });
	}, [play, navigate]);

	// Prefer the persisted profile row (updated by /settings) over the auth
	// user_metadata mirror, so name edits reflect immediately on the dashboard
	// after the settings cache is invalidated.
	const displayName =
		profile?.display_name ??
		(user?.user_metadata?.display_name as string | undefined) ??
		user?.email ??
		"Stranger";
	return <LobbyView displayName={displayName} />;
}
