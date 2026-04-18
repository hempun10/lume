import {
	type RockPaperScissorsState,
	RPS_MOVE_ADVANCE,
	roundOutcome,
} from "../../engines/rock-paper-scissors";
import { FinishedView } from "./finished-view";
import { PickButtons } from "./pick-buttons";
import { PickSlot } from "./pick-slot";
import { RoundResult } from "./round-result";
import { ScoreBar } from "./score-bar";

interface Props {
	state: RockPaperScissorsState;
	mySeat: "A" | "B" | null;
	myTurn: boolean;
	onMove: (move: number) => void;
}

/**
 * Rock Paper Scissors board.
 *
 * Seat-aware: each side's "own pick" is revealed locally the moment
 * it's submitted, but the opponent's pick is hidden until both are
 * in — so you commit blind, preventing a peek-and-counter UX.
 */
export function RockPaperScissorsBoard({
	state,
	mySeat,
	myTurn,
	onMove,
}: Props) {
	if (!mySeat) return null;

	const myPick = mySeat === "A" ? state.aPick : state.bPick;
	const theirPick = mySeat === "A" ? state.bPick : state.aPick;
	const myWins = mySeat === "A" ? state.aWins : state.bWins;
	const theirWins = mySeat === "A" ? state.bWins : state.aWins;

	if (state.phase === "finished") {
		const iWon = myWins > theirWins;
		return (
			<FinishedView
				state={state}
				mySeat={mySeat}
				myWins={myWins}
				theirWins={theirWins}
				iWon={iWon}
			/>
		);
	}

	const revealed = state.phase === "revealed";
	const picksVisible = revealed;

	// When revealed, compute whether advancing ends the match.
	let nextRoundEndsMatch = false;
	if (revealed && state.aPick !== null && state.bPick !== null) {
		const o = roundOutcome(state.aPick, state.bPick);
		if (o !== "tie") {
			const aAfter = state.aWins + (o === "a" ? 1 : 0);
			const bAfter = state.bWins + (o === "b" ? 1 : 0);
			nextRoundEndsMatch =
				aAfter >= state.winThreshold || bAfter >= state.winThreshold;
		}
	}

	return (
		<div className="flex w-full max-w-sm flex-col items-stretch gap-4">
			<ScoreBar
				myWins={myWins}
				theirWins={theirWins}
				threshold={state.winThreshold}
			/>

			<div className="grid grid-cols-2 gap-3">
				<PickSlot
					label="You"
					pick={myPick}
					visible={myPick !== null}
					accent="you"
				/>
				<PickSlot
					label="Stranger"
					pick={theirPick}
					visible={picksVisible}
					accent="them"
				/>
			</div>

			{revealed && myPick !== null && theirPick !== null ? (
				<RoundResult
					mySeat={mySeat}
					myPick={myPick}
					theirPick={theirPick}
					isLast={nextRoundEndsMatch}
					onAdvance={() => onMove(RPS_MOVE_ADVANCE)}
				/>
			) : (
				<PickButtons
					disabled={!myTurn || myPick !== null}
					onPick={(p) => onMove(p)}
					myPick={myPick}
				/>
			)}

			{!revealed && myPick !== null && (
				<p className="text-center text-xs text-muted-foreground">
					Waiting for stranger...
				</p>
			)}
		</div>
	);
}
