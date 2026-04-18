import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	currentPhrase,
	EMOJI_CHARADES_MOVE_ADVANCE,
	type EmojiCharadesState,
	optionsForRound,
	revealerSeatFor,
} from "../../engines/emoji-charades";
import { ClueCard } from "./clue-card";
import { FinishedView } from "./finished-view";
import { OptionsList } from "./options-list";
import { RoleLabel } from "./role-label";
import { ScoreBar } from "./score-bar";

interface Props {
	state: EmojiCharadesState;
	mySeat: "A" | "B" | null;
	myTurn: boolean;
	onMove: (move: number) => void;
}

/**
 * Emoji Charades board. Roles alternate every round — seat A reveals
 * on even rounds, seat B on odd. The revealer sees the full phrase
 * alongside the emoji clue; the guesser sees only the emojis and four
 * shuffled options.
 *
 * Correct option index is derived from shared state via
 * `optionsForRound` — both clients agree on button layout — so the UI
 * can hide it from the guesser until they commit.
 */
export function EmojiCharadesBoard({ state, mySeat, myTurn, onMove }: Props) {
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

	const phrase = currentPhrase(state);
	const layout = optionsForRound(state, state.round);
	if (!phrase || !layout) return null;

	const revealerSeat = revealerSeatFor(state);
	const iAmRevealer = mySeat === revealerSeat;
	const revealed = state.phase === "revealed";
	const locked = state.guess !== null;

	return (
		<div className="flex w-full max-w-md flex-col items-stretch gap-4">
			<ScoreBar
				myScore={myScore}
				theirScore={theirScore}
				round={state.round + 1}
				total={state.totalRounds}
			/>

			<RoleLabel iAmRevealer={iAmRevealer} />

			<ClueCard phrase={phrase} iAmRevealer={iAmRevealer} />

			<OptionsList
				round={state.round}
				options={layout.options}
				correctIdx={layout.correctIdx}
				guess={state.guess}
				revealed={revealed}
				iAmRevealer={iAmRevealer}
				locked={locked}
				myTurn={myTurn}
				onPick={(idx) => onMove(idx)}
			/>

			{revealed ? (
				<div className="flex justify-center">
					<Button
						size="sm"
						className="gap-2 active:scale-[0.97]"
						onClick={() => onMove(EMOJI_CHARADES_MOVE_ADVANCE)}
					>
						{state.round + 1 >= state.totalRounds
							? "See results"
							: "Next round"}
						<ChevronRight className="size-3.5" />
					</Button>
				</div>
			) : iAmRevealer ? (
				<p className="text-center text-xs text-muted-foreground">
					Waiting for stranger to guess...
				</p>
			) : locked ? (
				<p className="text-center text-xs text-muted-foreground">Locked in.</p>
			) : (
				<p className="text-center text-xs text-muted-foreground">
					Which phrase do the emojis mean?
				</p>
			)}

			{/* biome-ignore lint/a11y/useSemanticElements: hidden status for screen readers */}
			<span className="sr-only" role="status">
				{iAmRevealer
					? "You are revealing this round"
					: "You are guessing this round"}
			</span>
		</div>
	);
}
