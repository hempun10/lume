import type { MatchMode } from "../types";
import { MatchConfigCard } from "./match-config-card";

interface LobbyViewProps {
	displayName: string;
}

export function LobbyView({ displayName }: LobbyViewProps) {
	function handleStartMatching(mode: MatchMode, interests: string[]) {
		// TODO: Integrate with matching state machine in PR 2
		console.log("Start matching:", { mode, interests });
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
