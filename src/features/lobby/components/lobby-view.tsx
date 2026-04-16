import { useMatchState } from "../hooks/use-match-state";
import type { MatchMode } from "../types";
import { MatchConfigCard } from "./match-config-card";
import { SearchingView } from "./searching-view";

interface LobbyViewProps {
	displayName: string;
}

export function LobbyView({ displayName }: LobbyViewProps) {
	const { state, startSearching, cancelSearching } = useMatchState();

	function handleStartMatching(mode: MatchMode, interests: string[]) {
		startSearching(mode, interests);
	}

	if (state.status === "searching") {
		return (
			<SearchingView
				mode={state.mode}
				interests={state.interests}
				elapsedSeconds={state.elapsedSeconds}
				onCancel={cancelSearching}
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

			{/* Recent activity — minimal for now */}
			<div className="text-center text-sm text-muted-foreground">
				<p>Start a conversation or play a game with a stranger.</p>
			</div>
		</div>
	);
}
