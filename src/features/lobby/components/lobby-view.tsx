import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { useAuth } from "@/features/auth";
import { GAMES } from "@/features/games/data/games";
import {
	clearPendingGame,
	getPendingGame,
} from "@/features/games/data/pending-game";
import { supabase } from "@/lib/supabase/client";
import { useMatchmaking } from "../hooks/use-matchmaking";
import { GamesRail } from "./games-rail";
import { LobbyGreeting } from "./lobby-greeting";
import { LobbyHeroCard } from "./lobby-hero-card";
import { PromptPreviewCard } from "./prompt-preview-card";
import { SearchingView } from "./searching-view";
import { YourVibeCard } from "./your-vibe-card";

interface LobbyViewProps {
	displayName: string;
}

export function LobbyView({ displayName }: LobbyViewProps) {
	const { state, startMatching, cancelMatching } = useMatchmaking();
	const { user } = useAuth();

	const userId = user?.id ?? "";

	const { data: profile, isSuccess: profileLoaded } = useQuery({
		queryKey: ["profiles", userId, "lobby"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("profiles")
				.select("interests, region")
				.eq("id", userId)
				.single();
			if (error) throw error;
			return data;
		},
		enabled: !!userId,
		staleTime: 1000 * 60 * 5,
	});

	const interests = profile?.interests ?? [];

	/**
	 * If the user got here via a game-card "Play" click, auto-start
	 * matching with their saved interests as soon as the profile has
	 * loaded. Gated by a ref so we only ever fire once per mount, and
	 * a pending-game lookup that we don't clear here — the chat view
	 * will clear it after sending the invite.
	 */
	const autoStartedRef = useRef(false);
	useEffect(() => {
		if (autoStartedRef.current) return;
		if (!profileLoaded) return;
		if (state.status !== "idle") return;
		const pending = getPendingGame();
		if (!pending) return;
		const known = GAMES.some(
			(g) => g.id === pending && g.status === "available",
		);
		if (!known) {
			clearPendingGame();
			return;
		}
		autoStartedRef.current = true;
		startMatching(interests);
	}, [profileLoaded, interests, startMatching, state.status]);

	if (
		state.status === "searching" ||
		state.status === "queuing" ||
		state.status === "matched" ||
		state.status === "navigating"
	) {
		const pending = getPendingGame();
		const pendingGame = pending
			? (GAMES.find((g) => g.id === pending)?.name ?? undefined)
			: undefined;

		function handleCancel() {
			clearPendingGame();
			cancelMatching();
		}

		return (
			<SearchingView
				interests={state.interests}
				elapsedSeconds={state.elapsedSeconds}
				matchStatus={state.status}
				onCancel={handleCancel}
				gameName={pendingGame}
			/>
		);
	}

	return (
		<div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 md:px-6 md:py-10">
			<LobbyGreeting displayName={displayName} />

			{state.error && (
				<div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-destructive text-sm">
					<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
					<p>{state.error}</p>
				</div>
			)}

			<LobbyHeroCard
				key={profileLoaded ? "ready" : "pending"}
				defaultInterests={interests}
				onStartMatching={startMatching}
			/>

			<GamesRail />

			<PromptPreviewCard interests={interests} />

			<YourVibeCard
				displayName={displayName}
				interests={interests}
				region={profile?.region}
			/>
		</div>
	);
}
