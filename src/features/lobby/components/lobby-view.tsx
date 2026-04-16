import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/features/auth";
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

	if (
		state.status === "searching" ||
		state.status === "queuing" ||
		state.status === "matched" ||
		state.status === "navigating"
	) {
		return (
			<SearchingView
				interests={state.interests}
				elapsedSeconds={state.elapsedSeconds}
				matchStatus={state.status}
				onCancel={cancelMatching}
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
