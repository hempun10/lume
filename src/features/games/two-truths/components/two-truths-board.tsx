import type { Dispatch, SetStateAction } from "react";
import { useRef } from "react";
import {
	applyReveal,
	applyStatements,
	readerSeatFor,
	TWO_TRUTHS_MOVE_ADVANCE,
	type TwoTruthsPick,
	type TwoTruthsState,
} from "../../engines/two-truths";
import { ComposeForm } from "./compose-form";
import { FinishedView } from "./finished-view";
import { GuessingView } from "./guessing-view";
import { RevealedView } from "./revealed-view";
import { RoleLabel } from "./role-label";
import { ScoreBar } from "./score-bar";
import { WaitingForComposer } from "./waiting-for-composer";

interface Props {
	state: TwoTruthsState;
	mySeat: "A" | "B" | null;
	myTurn: boolean;
	onMove: (move: number) => void;
	sendCustomEvent: (event: string, payload: unknown) => void;
	setGameState: Dispatch<SetStateAction<TwoTruthsState | null>>;
}

/**
 * Two Truths and a Lie — user-authored. The reader writes three
 * statements and marks which is the lie; the guesser picks.
 *
 * Non-numeric transport goes through `sendCustomEvent`:
 *   - `statements` {statements} — reader → guesser, kicks off guessing
 *   - `reveal` {lieIdx} — reader → guesser after guess, triggers score
 *
 * The reader keeps `lieIdx` in local state (`lieIdxRef`) until reveal
 * so the guesser can't sniff it from shared state.
 */
export function TwoTruthsBoard({
	state,
	mySeat,
	myTurn,
	onMove,
	sendCustomEvent,
	setGameState,
}: Props) {
	// Reader's private pick — never put in shared state until reveal.
	// Kept in a ref so it survives re-renders but doesn't trigger them.
	const lieIdxRef = useRef<TwoTruthsPick | null>(null);

	if (!mySeat) return null;

	const myScore = mySeat === "A" ? state.aScore : state.bScore;
	const theirScore = mySeat === "A" ? state.bScore : state.aScore;

	if (state.phase === "finished") {
		return (
			<FinishedView
				state={state}
				mySeat={mySeat}
				myScore={myScore}
				theirScore={theirScore}
			/>
		);
	}

	const readerSeat = readerSeatFor(state);
	const iAmReader = mySeat === readerSeat;

	return (
		<div className="flex w-full max-w-md flex-col items-stretch gap-4">
			<ScoreBar
				myScore={myScore}
				theirScore={theirScore}
				round={state.round + 1}
				total={state.totalRounds}
			/>

			<RoleLabel iAmReader={iAmReader} phase={state.phase} />

			{state.phase === "composing" ? (
				iAmReader ? (
					<ComposeForm
						round={state.round}
						onSubmit={(statements, lieIdx) => {
							lieIdxRef.current = lieIdx;
							sendCustomEvent("statements", { statements });
							setGameState((prev) =>
								prev ? applyStatements(prev, statements) : prev,
							);
						}}
					/>
				) : (
					<WaitingForComposer />
				)
			) : null}

			{state.phase === "guessing" && state.statements && (
				<GuessingView
					statements={state.statements}
					iAmReader={iAmReader}
					guess={state.guess}
					myTurn={myTurn}
					onPick={(idx) => onMove(idx)}
					lieIdxHint={iAmReader ? lieIdxRef.current : null}
					onReveal={() => {
						const lieIdx = lieIdxRef.current;
						if (lieIdx === null) return;
						sendCustomEvent("reveal", { lieIdx });
						setGameState((prev) => (prev ? applyReveal(prev, lieIdx) : prev));
					}}
				/>
			)}

			{state.phase === "revealed" &&
				state.statements &&
				state.lieIdx !== null && (
					<RevealedView
						statements={state.statements}
						lieIdx={state.lieIdx}
						guess={state.guess}
						onAdvance={() => {
							lieIdxRef.current = null;
							onMove(TWO_TRUTHS_MOVE_ADVANCE);
						}}
						isLast={state.round + 1 >= state.totalRounds}
					/>
				)}
		</div>
	);
}
