import type { Dispatch, SetStateAction } from "react";
import { useRef, useState } from "react";
import {
	applyReveal,
	applyRoundSetup,
	DRAW_AND_GUESS_MOVE_ADVANCE,
	type DrawAndGuessPick,
	type DrawAndGuessState,
	drawerSeatFor,
} from "../../engines/draw-and-guess";
import { FinishedView } from "./finished-view";
import { RoleLabel } from "./role-label";
import { RoundView } from "./round-view";
import { ScoreBar } from "./score-bar";
import { SetupCoordinator } from "./setup-coordinator";

interface Props {
	state: DrawAndGuessState;
	mySeat: "A" | "B" | null;
	myTurn: boolean;
	onMove: (move: number) => void;
	sendCustomEvent: (event: string, payload: unknown) => void;
	setGameState: Dispatch<SetStateAction<DrawAndGuessState | null>>;
}

/**
 * Draw & Guess board. Drawer sketches a target word; guesser picks
 * from 4 multiple-choice options. Strokes broadcast via `customEvents`
 * in ~50ms batches.
 *
 * This file is the thin composition root. State + drawing logic lives
 * in feature subfolders under `draw-and-guess/`.
 */
export function DrawAndGuessBoard({
	state,
	mySeat,
	myTurn,
	onMove,
	sendCustomEvent,
	setGameState,
}: Props) {
	// Drawer's private knowledge of the correct option index for this
	// round. Only set on the drawer's side. Cleared between rounds.
	const correctIdxRef = useRef<DrawAndGuessPick | null>(null);
	// Drawer's local target word (for UI only).
	const [targetWord, setTargetWord] = useState<string | null>(null);

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

	const drawerSeat = drawerSeatFor(state);
	const iAmDrawer = mySeat === drawerSeat;

	return (
		<div className="flex w-full max-w-md flex-col items-stretch gap-3">
			<ScoreBar
				myScore={myScore}
				theirScore={theirScore}
				round={state.round + 1}
				total={state.totalRounds}
			/>

			<RoleLabel iAmDrawer={iAmDrawer} phase={state.phase} />

			{state.phase === "setup" && (
				<SetupCoordinator
					iAmDrawer={iAmDrawer}
					onDrawerReady={(options, correctIdx, word, difficulty) => {
						correctIdxRef.current = correctIdx;
						setTargetWord(word);
						sendCustomEvent("round_setup", { options, difficulty });
						setGameState((prev) =>
							prev ? applyRoundSetup(prev, options, difficulty) : prev,
						);
					}}
				/>
			)}

			{(state.phase === "drawing" || state.phase === "revealed") &&
				state.options && (
					<RoundView
						state={state}
						options={state.options}
						iAmDrawer={iAmDrawer}
						myTurn={myTurn}
						targetWord={iAmDrawer ? targetWord : null}
						correctIdxForDrawer={correctIdxRef.current}
						onGuess={(idx) => onMove(idx)}
						onReveal={() => {
							const correctIdx = correctIdxRef.current;
							if (correctIdx === null) return;
							sendCustomEvent("reveal", { correctIdx });
							setGameState((prev) =>
								prev ? applyReveal(prev, correctIdx) : prev,
							);
						}}
						onAdvance={() => {
							correctIdxRef.current = null;
							setTargetWord(null);
							onMove(DRAW_AND_GUESS_MOVE_ADVANCE);
						}}
						sendCustomEvent={sendCustomEvent}
					/>
				)}
		</div>
	);
}
