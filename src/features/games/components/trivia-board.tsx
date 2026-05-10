import { Check, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TRIVIA_QUESTIONS } from "../data/trivia-questions";
import {
	currentQuestion,
	TRIVIA_MOVE_ADVANCE,
	type TriviaPick,
	type TriviaState,
} from "../engines/trivia";

interface Props {
	state: TriviaState;
	mySeat: "A" | "B" | null;
	myTurn: boolean;
	onMove: (move: number) => void;
}

/**
 * Trivia board. Seat-aware: opponent's answer is hidden on your
 * screen until you've committed your own, so you can't copy them.
 *
 *  - answering → 4 option buttons, locks after pick
 *  - revealed  → correct answer highlighted, both picks labeled,
 *                Next button advances
 *  - finished  → score, winner, per-round history
 */
export function TriviaBoard({ state, mySeat, myTurn, onMove }: Props) {
	if (!mySeat) return null;

	const myPick = mySeat === "A" ? state.aPick : state.bPick;
	const theirPick = mySeat === "A" ? state.bPick : state.aPick;
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

	const question = currentQuestion(state);
	if (!question) return null;

	const revealed = state.phase === "revealed";

	return (
		<div className="flex w-full max-w-md flex-col items-stretch gap-4">
			<ScoreBar
				myScore={myScore}
				theirScore={theirScore}
				round={state.round + 1}
				total={state.totalRounds}
			/>

			<p className="text-balance text-center text-sm font-medium">
				{question.q}
			</p>

			<div className="grid gap-2">
				{question.options.map((label, i) => {
					const idx = i as TriviaPick;
					const isMine = myPick === idx;
					const isTheirs = revealed && theirPick === idx;
					const isCorrect = idx === question.answer;
					const locked = myPick !== null;

					let border = "border-border";
					let bg = "bg-card";
					let tone = "text-foreground";
					if (revealed) {
						if (isCorrect) {
							border = "border-primary";
							bg = "bg-primary/10";
							tone = "text-foreground";
						} else if (isMine || isTheirs) {
							border = "border-destructive/60";
							bg = "bg-destructive/5";
							tone = "text-muted-foreground";
						} else {
							tone = "text-muted-foreground";
						}
					} else if (isMine) {
						border = "border-primary";
						bg = "bg-primary/10";
					}

					return (
						<button
							key={`${state.round}-${i}`}
							type="button"
							disabled={!myTurn || locked || revealed}
							onClick={() => onMove(idx)}
							aria-pressed={isMine}
							className={cn(
								"flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors motion-safe:duration-150 ease-out",
								"disabled:cursor-not-allowed",
								border,
								bg,
								tone,
								!revealed && !locked && "hover:border-border/80",
								!revealed && !locked && "active:scale-[0.99]",
							)}
						>
							<span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border/60 text-xs font-semibold tabular-nums text-muted-foreground">
								{String.fromCharCode(65 + i)}
							</span>
							<span className="flex-1 text-pretty text-sm">{label}</span>
							{revealed && isCorrect && (
								<Check
									className="size-4 shrink-0 text-primary"
									aria-label="Correct answer"
								/>
							)}
							{revealed && !isCorrect && (isMine || isTheirs) && (
								<X
									className="size-4 shrink-0 text-destructive"
									aria-label="Incorrect"
								/>
							)}
							{revealed && (isMine || isTheirs) && (
								<span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
									{isMine && isTheirs ? "Both" : isMine ? "You" : "Stranger"}
								</span>
							)}
						</button>
					);
				})}
			</div>

			{revealed ? (
				<div className="flex justify-center">
					<Button
						size="sm"
						className="gap-2 active:scale-[0.97]"
						onClick={() => onMove(TRIVIA_MOVE_ADVANCE)}
					>
						{state.round + 1 >= state.totalRounds
							? "See results"
							: "Next question"}
						<ChevronRight className="size-3.5" />
					</Button>
				</div>
			) : myPick !== null ? (
				<p className="text-center text-xs text-muted-foreground">
					Locked in. Waiting for stranger...
				</p>
			) : null}
		</div>
	);
}

function ScoreBar({
	myScore,
	theirScore,
	round,
	total,
}: {
	myScore: number;
	theirScore: number;
	round: number;
	total: number;
}) {
	return (
		<div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
			<span className="font-medium text-foreground tabular-nums">
				You {myScore}
			</span>
			<span className="text-border">vs</span>
			<span className="tabular-nums">Stranger {theirScore}</span>
			<span className="text-border">·</span>
			<span className="tabular-nums">
				Q {round} of {total}
			</span>
		</div>
	);
}

function FinishedView({
	state,
	mySeat,
	myScore,
	theirScore,
}: {
	state: TriviaState;
	mySeat: "A" | "B";
	myScore: number;
	theirScore: number;
}) {
	let tagline: string;
	let tone: "win" | "lose" | "tie";
	if (myScore > theirScore) {
		tagline = "You won";
		tone = "win";
	} else if (myScore < theirScore) {
		tagline = "You lost";
		tone = "lose";
	} else {
		tagline = "Tie — equally unhinged brains";
		tone = "tie";
	}

	return (
		<div className="flex w-full max-w-md flex-col items-stretch gap-4">
			<div className="flex flex-col items-center gap-1">
				<p
					className={cn(
						"text-xs uppercase tracking-wide",
						tone === "win" && "text-primary",
						tone === "lose" && "text-destructive",
						tone === "tie" && "text-muted-foreground",
					)}
				>
					{tagline}
				</p>
				<p className="text-balance text-center text-2xl font-semibold tabular-nums">
					{myScore} — {theirScore}
				</p>
			</div>

			<ul className="flex flex-col gap-1.5">
				{state.history.map((h, i) => {
					const myPick = mySeat === "A" ? h.aPick : h.bPick;
					const theirPick = mySeat === "A" ? h.bPick : h.aPick;
					const iGot = myPick === h.correct;
					const theyGot = theirPick === h.correct;
					const question = TRIVIA_QUESTIONS[h.questionIdx];
					return (
						<li
							key={`${i}-${h.questionIdx}`}
							className={cn(
								"flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs",
								iGot && !theyGot && "border-primary/40 bg-primary/5",
								!iGot && theyGot && "border-destructive/30 bg-destructive/5",
								iGot && theyGot && "border-primary/20 bg-primary/5",
								!iGot && !theyGot && "border-border bg-card",
							)}
						>
							<span className="min-w-0 flex-1 truncate text-muted-foreground">
								{question?.q ?? `Question ${i + 1}`}
							</span>
							<span className="flex shrink-0 items-center gap-2">
								<ResultPip correct={iGot} label="You" />
								<ResultPip correct={theyGot} label="Them" />
							</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
}

function ResultPip({ correct, label }: { correct: boolean; label: string }) {
	return (
		<span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide">
			<span
				className={cn(
					"flex size-4 items-center justify-center rounded-full",
					correct
						? "bg-primary/20 text-primary"
						: "bg-destructive/15 text-destructive",
				)}
			>
				{correct ? (
					<Check className="size-2.5" aria-hidden />
				) : (
					<X className="size-2.5" aria-hidden />
				)}
			</span>
			<span className="text-muted-foreground">{label}</span>
		</span>
	);
}
