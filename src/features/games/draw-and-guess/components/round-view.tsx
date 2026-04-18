import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
	DrawAndGuessPick,
	DrawAndGuessState,
} from "../../engines/draw-and-guess";
import { useRoundTimer } from "../hooks/use-round-timer";
import { DifficultyPill } from "./difficulty-pill";
import { DrawingSurface } from "./drawing-surface";
import { GuessPanel } from "./guess-panel";
import { TimerBar } from "./timer-bar";
import { WordRevealOverlay } from "./word-reveal-overlay";

export function RoundView({
	state,
	options,
	iAmDrawer,
	myTurn,
	targetWord,
	correctIdxForDrawer,
	onGuess,
	onReveal,
	onAdvance,
	sendCustomEvent,
}: {
	state: DrawAndGuessState;
	options: readonly [string, string, string, string];
	iAmDrawer: boolean;
	myTurn: boolean;
	targetWord: string | null;
	correctIdxForDrawer: DrawAndGuessPick | null;
	onGuess: (idx: DrawAndGuessPick) => void;
	onReveal: () => void;
	onAdvance: () => void;
	sendCustomEvent: (event: string, payload: unknown) => void;
}) {
	const revealed = state.phase === "revealed";
	const locked = state.guess !== null;
	const isLast = state.round + 1 >= state.totalRounds;

	const { remaining, showWordOverlay } = useRoundTimer({
		round: state.round,
		revealed,
		iAmDrawer,
		locked,
		guess: state.guess,
		correctIdxForDrawer,
		targetWord,
		onReveal,
	});

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-2">
				<div className="flex-1">
					<TimerBar remainingMs={remaining} revealed={revealed} />
				</div>
				{state.difficulty && <DifficultyPill tier={state.difficulty} />}
			</div>

			<div className="relative">
				<DrawingSurface
					iAmDrawer={iAmDrawer}
					revealed={revealed}
					sendCustomEvent={sendCustomEvent}
					roundKey={state.round}
				/>
				{iAmDrawer && targetWord && (
					<WordRevealOverlay word={targetWord} show={showWordOverlay} />
				)}
				{iAmDrawer && targetWord && !revealed && !showWordOverlay && (
					<div className="pointer-events-none absolute left-2 top-2 rounded-md bg-background/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur">
						Draw:{" "}
						<span className="text-foreground normal-case">{targetWord}</span>
					</div>
				)}
			</div>

			<GuessPanel
				options={options}
				iAmDrawer={iAmDrawer}
				guess={state.guess}
				revealed={revealed}
				correctIdx={state.correctIdx}
				myTurn={myTurn && !locked}
				onGuess={onGuess}
			/>

			{revealed ? (
				<div className="flex justify-center">
					<Button
						size="sm"
						className="gap-2 active:scale-[0.97]"
						onClick={onAdvance}
					>
						{isLast ? "See results" : "Next round"}
						<ChevronRight className="size-3.5" />
					</Button>
				</div>
			) : iAmDrawer ? (
				locked ? (
					<p className="text-center text-xs text-muted-foreground">
						Stranger locked in — revealing...
					</p>
				) : (
					<p className="text-center text-xs text-muted-foreground">
						Keep drawing — stranger hasn't guessed yet.
					</p>
				)
			) : locked ? (
				<p className="text-center text-xs text-muted-foreground">
					Locked in — waiting for reveal...
				</p>
			) : (
				<p className="text-center text-xs text-muted-foreground">
					Pick what it is.
				</p>
			)}
		</div>
	);
}
