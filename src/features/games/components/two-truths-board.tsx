import { Check, ChevronRight, Eye, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TWO_TRUTHS_TRIPLES } from "../data/two-truths-triples";
import {
	currentTriple,
	readerSeatFor,
	TWO_TRUTHS_MOVE_ADVANCE,
	type TwoTruthsPick,
	type TwoTruthsState,
} from "../engines/two-truths";

interface Props {
	state: TwoTruthsState;
	mySeat: "A" | "B" | null;
	myTurn: boolean;
	onMove: (move: number) => void;
}

/**
 * Two Truths and a Lie board. Roles alternate every round — reader on
 * even rounds for seat A, odd rounds for seat B. The reader watches
 * and waits; the guesser picks which statement they think is the lie.
 *
 * The lie index is in shared state but the UI hides it from the
 * guesser until they commit (same trick trivia uses).
 */
export function TwoTruthsBoard({ state, mySeat, myTurn, onMove }: Props) {
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

	const triple = currentTriple(state);
	if (!triple) return null;

	const readerSeat = readerSeatFor(state);
	const iAmReader = mySeat === readerSeat;
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

			<div className="flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
				{iAmReader ? (
					<>
						<Eye className="size-3" aria-hidden />
						<span>You're reading — stranger guesses</span>
					</>
				) : (
					<>
						<MessageCircle className="size-3" aria-hidden />
						<span>Stranger is reading — spot the lie</span>
					</>
				)}
			</div>

			<ul className="flex flex-col gap-2">
				{triple.statements.map((text, i) => {
					const idx = i as TwoTruthsPick;
					const isMyGuess = state.guess === idx;
					const isLie = idx === triple.lieIdx;

					let border = "border-border";
					let bg = "bg-card";
					let tone = "text-foreground";
					if (revealed) {
						if (isLie) {
							border = "border-destructive";
							bg = "bg-destructive/10";
						} else if (isMyGuess) {
							// guessed a truth as the lie — wrong
							border = "border-muted-foreground/40";
							bg = "bg-muted/40";
							tone = "text-muted-foreground";
						} else {
							tone = "text-muted-foreground";
						}
					} else if (isMyGuess) {
						border = "border-brand-500";
						bg = "bg-brand-500/10";
					}

					// Reader is locked out of pressing; guesser can press only
					// while guessing phase and nothing picked yet.
					const disabled = iAmReader || revealed || locked || !myTurn;

					return (
						<li key={`${state.round}-${i}`}>
							<button
								type="button"
								disabled={disabled}
								onClick={() => onMove(idx)}
								aria-pressed={isMyGuess}
								className={cn(
									"flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors motion-safe:duration-150 ease-out",
									"disabled:cursor-not-allowed",
									border,
									bg,
									tone,
									!disabled && "hover:border-border/80 active:scale-[0.99]",
								)}
							>
								<span
									className={cn(
										"mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold tabular-nums",
										revealed && isLie
											? "border-destructive bg-destructive/20 text-destructive"
											: "border-border/60 text-muted-foreground",
									)}
								>
									{i + 1}
								</span>
								<span className="flex-1 text-pretty text-sm leading-relaxed">
									{text}
								</span>
								{revealed && isLie && (
									<span className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-destructive">
										<X className="size-3" aria-hidden />
										Lie
									</span>
								)}
								{revealed && isMyGuess && !isLie && (
									<span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
										Your guess
									</span>
								)}
							</button>
						</li>
					);
				})}
			</ul>

			{revealed && (
				<div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
					<span className="font-semibold text-foreground">Why:</span>{" "}
					{triple.explanation}
				</div>
			)}

			{revealed ? (
				<div className="flex justify-center">
					<Button
						size="sm"
						className="gap-2 active:scale-[0.97]"
						onClick={() => onMove(TWO_TRUTHS_MOVE_ADVANCE)}
					>
						{state.round + 1 >= state.totalRounds
							? "See results"
							: "Next round"}
						<ChevronRight className="size-3.5" />
					</Button>
				</div>
			) : iAmReader ? (
				<p className="text-center text-xs text-muted-foreground">
					Waiting for stranger to guess...
				</p>
			) : locked ? (
				<p className="text-center text-xs text-muted-foreground">Locked in.</p>
			) : (
				<p className="text-center text-xs text-muted-foreground">
					Which one is the lie?
				</p>
			)}

			{/* Reader sees a subtle hint of which is the lie so they know the answer */}
			{iAmReader && !revealed && (
				<p className="text-center text-[10px] text-muted-foreground/70">
					(You can see the answer: #{triple.lieIdx + 1} is the lie)
				</p>
			)}

			{/* biome-ignore lint/a11y/useSemanticElements: hidden status exists for guesser's peace of mind */}
			<span className="sr-only" role="status">
				{readerSeat === mySeat
					? "You are reading this round"
					: "You are guessing this round"}
			</span>
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
				Round {round} of {total}
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
	state: TwoTruthsState;
	mySeat: "A" | "B";
	myScore: number;
	theirScore: number;
}) {
	let tagline: string;
	let tone: "win" | "lose" | "tie";
	if (myScore > theirScore) {
		tagline = "You called more lies";
		tone = "win";
	} else if (myScore < theirScore) {
		tagline = "Stranger read you better";
		tone = "lose";
	} else {
		tagline = "Tie — both of you are decent liars";
		tone = "tie";
	}

	return (
		<div className="flex w-full max-w-md flex-col items-stretch gap-4">
			<div className="flex flex-col items-center gap-1">
				<p
					className={cn(
						"text-xs uppercase tracking-wide",
						tone === "win" && "text-brand-500",
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
					const iGuessed = h.readerSeat !== mySeat;
					const got = h.guess === h.correct;
					const triple = TWO_TRUTHS_TRIPLES[h.tripleIdx];
					const lieText = triple?.statements[h.correct] ?? "(missing)";
					return (
						<li
							key={`${i}-${h.tripleIdx}`}
							className={cn(
								"flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs",
								iGuessed && got && "border-brand-500/40 bg-brand-500/5",
								iGuessed && !got && "border-destructive/30 bg-destructive/5",
								!iGuessed && "border-border bg-card",
							)}
						>
							<span className="min-w-0 flex-1 truncate text-muted-foreground">
								Lie: <span className="text-foreground">{lieText}</span>
							</span>
							<span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wide">
								{iGuessed ? (
									got ? (
										<span className="flex items-center gap-1 text-brand-500">
											<Check className="size-3" aria-hidden />
											Got it
										</span>
									) : (
										<span className="flex items-center gap-1 text-destructive">
											<X className="size-3" aria-hidden />
											Missed
										</span>
									)
								) : (
									<span className="text-muted-foreground">You read</span>
								)}
							</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
