import { Check, ChevronRight, Eye, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EMOJI_CHARADES_PHRASES } from "../data/emoji-charades-phrases";
import {
	currentPhrase,
	EMOJI_CHARADES_MOVE_ADVANCE,
	type EmojiCharadesPick,
	type EmojiCharadesState,
	optionsForRound,
	revealerSeatFor,
} from "../engines/emoji-charades";

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

			<div className="flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
				{iAmRevealer ? (
					<>
						<Eye className="size-3" aria-hidden />
						<span>You see the answer — stranger guesses</span>
					</>
				) : (
					<>
						<MessageCircle className="size-3" aria-hidden />
						<span>Decode the emojis — pick the phrase</span>
					</>
				)}
			</div>

			<div className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-muted/30 px-4 py-5">
				<p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
					{phrase.category}
				</p>
				<p className="text-center text-4xl leading-none tracking-wide">
					{phrase.emojis}
				</p>
				{iAmRevealer && (
					<p className="mt-1 text-center text-xs text-muted-foreground">
						Answer:{" "}
						<span className="font-semibold text-foreground">
							{phrase.phrase}
						</span>
					</p>
				)}
			</div>

			<ul className="flex flex-col gap-2">
				{layout.options.map((text, i) => {
					const idx = i as EmojiCharadesPick;
					const isMyGuess = state.guess === idx;
					const isCorrect = idx === layout.correctIdx;

					let border = "border-border";
					let bg = "bg-card";
					let tone = "text-foreground";
					if (revealed) {
						if (isCorrect) {
							border = "border-brand-500";
							bg = "bg-brand-500/10";
						} else if (isMyGuess) {
							border = "border-destructive";
							bg = "bg-destructive/10";
							tone = "text-muted-foreground";
						} else {
							tone = "text-muted-foreground";
						}
					} else if (isMyGuess) {
						border = "border-brand-500";
						bg = "bg-brand-500/10";
					}

					const disabled = iAmRevealer || revealed || locked || !myTurn;

					return (
						<li key={`${state.round}-${i}-${text}`}>
							<button
								type="button"
								disabled={disabled}
								onClick={() => onMove(idx)}
								aria-pressed={isMyGuess}
								className={cn(
									"flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors motion-safe:duration-150 ease-out",
									"disabled:cursor-not-allowed",
									border,
									bg,
									tone,
									!disabled && "hover:border-border/80 active:scale-[0.99]",
								)}
							>
								<span
									className={cn(
										"flex size-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold tabular-nums",
										revealed && isCorrect
											? "border-brand-500 bg-brand-500/20 text-brand-500"
											: "border-border/60 text-muted-foreground",
									)}
								>
									{String.fromCharCode(65 + i)}
								</span>
								<span className="flex-1 text-pretty text-sm leading-relaxed">
									{text}
								</span>
								{revealed && isCorrect && (
									<span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-brand-500">
										<Check className="size-3" aria-hidden />
										Answer
									</span>
								)}
								{revealed && isMyGuess && !isCorrect && (
									<span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-destructive">
										<X className="size-3" aria-hidden />
										Your pick
									</span>
								)}
							</button>
						</li>
					);
				})}
			</ul>

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
	state: EmojiCharadesState;
	mySeat: "A" | "B";
	myScore: number;
	theirScore: number;
}) {
	let tagline: string;
	let tone: "win" | "lose" | "tie";
	if (myScore > theirScore) {
		tagline = "You decoded more clues";
		tone = "win";
	} else if (myScore < theirScore) {
		tagline = "Stranger read the emojis better";
		tone = "lose";
	} else {
		tagline = "Tie — equally fluent in emoji";
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
					const iGuessed = h.revealerSeat !== mySeat;
					const got = h.guess === h.correct;
					const phrase = EMOJI_CHARADES_PHRASES[h.phraseIdx];
					return (
						<li
							key={`${i}-${h.phraseIdx}`}
							className={cn(
								"flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs",
								iGuessed && got && "border-brand-500/40 bg-brand-500/5",
								iGuessed && !got && "border-destructive/30 bg-destructive/5",
								!iGuessed && "border-border bg-card",
							)}
						>
							<span className="flex min-w-0 flex-1 items-center gap-2">
								<span className="shrink-0 text-base leading-none">
									{phrase?.emojis ?? ""}
								</span>
								<span className="truncate text-foreground">
									{phrase?.phrase ?? "(missing)"}
								</span>
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
									<span className="text-muted-foreground">You revealed</span>
								)}
							</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
