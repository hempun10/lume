import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth";
import { supabase } from "@/lib/supabase/client";
import { useMatchmaking } from "../hooks/use-matchmaking";
import { MatchConfigCard } from "./match-config-card";
import { SearchingView } from "./searching-view";

interface LobbyViewProps {
	displayName: string;
}

export function LobbyView({ displayName }: LobbyViewProps) {
	const { state, startMatching, cancelMatching } = useMatchmaking();
	const { user } = useAuth();

	const userId = user?.id ?? "";

	// Fetch profile interests to pre-fill the match config
	const { data: profile } = useQuery({
		queryKey: ["profiles", userId, "interests"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("profiles")
				.select("interests")
				.eq("id", userId)
				.single();
			if (error) throw error;
			return data;
		},
		enabled: !!userId,
		staleTime: 1000 * 60 * 5,
	});

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
		<div className="flex h-full flex-col items-center justify-center gap-8 px-4">
			<div className="text-center">
				<h1 className="text-2xl font-semibold text-foreground">
					Welcome back, {displayName}
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Ready to meet someone new?
				</p>
			</div>

			<MatchConfigCard
				defaultInterests={profile?.interests ?? []}
				onStartMatching={startMatching}
			/>

			{state.error && <p className="text-sm text-destructive">{state.error}</p>}

			<div className="text-center text-sm text-muted-foreground">
				<p>Start a conversation with a stranger who shares your interests.</p>
			</div>
		</div>
	);
}
