import { useMatchmaking } from "../hooks/use-matchmaking";
import type { MatchMode } from "../types";
import { MatchConfigCard } from "./match-config-card";
import { SearchingView } from "./searching-view";

interface LobbyViewProps {
	displayName: string;
}

export function LobbyView({ displayName }: LobbyViewProps) {
	const { state, startMatching, cancelMatching } = useMatchmaking();

	function handleStartMatching(mode: MatchMode, interests: string[]) {
		startMatching(mode, interests);
	}

	if (
		state.status === "searching" ||
		state.status === "queuing" ||
		state.status === "matched" ||
		state.status === "navigating"
	) {
		return (
			<SearchingView
				mode={state.mode}
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

			<MatchConfigCard onStartMatching={handleStartMatching} />

			{state.error && <p className="text-sm text-destructive">{state.error}</p>}

			<div className="text-center text-sm text-muted-foreground">
				<p>Start a conversation or play a game with a stranger.</p>
			</div>
		</div>
	);
}
