import {
	Check,
	ChevronRight,
	Eye,
	Lightbulb,
	MessageCircle,
	Send,
	X,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { type FormEvent, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { suggestPrompt } from "../data/two-truths-prompts";
import {
	applyReveal,
	applyStatements,
	readerSeatFor,
	TWO_TRUTHS_MOVE_ADVANCE,
	TWO_TRUTHS_STATEMENT_MAX,
	type TwoTruthsPick,
	type TwoTruthsState,
} from "../engines/two-truths";

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

/**
 * Companion effect-hook mounted outside the board. Custom-event
 * handlers are registered on `active-game.tsx` via the `customEvents`
 * option — but that option lives on `useGameRoom` at the parent level.
 *
 * We solve this by registering handlers via `setGameState` + a small
 * dispatcher wired into ActiveGame. See `use-two-truths-bridge` below.
 */

/* ----------------------------- subcomponents ----------------------------- */

function RoleLabel({
	iAmReader,
	phase,
}: {
	iAmReader: boolean;
	phase: TwoTruthsState["phase"];
}) {
	let text: string;
	let Icon = iAmReader ? Eye : MessageCircle;
	if (iAmReader) {
		if (phase === "composing") text = "Your turn — write 2 truths + 1 lie";
		else if (phase === "guessing") text = "Stranger is guessing...";
		else text = "You read this round";
		Icon = Eye;
	} else {
		if (phase === "composing") text = "Stranger is writing...";
		else if (phase === "guessing") text = "Spot the lie";
		else text = "You guessed this round";
		Icon = MessageCircle;
	}
	return (
		<div className="flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
			<Icon className="size-3" aria-hidden />
			<span>{text}</span>
		</div>
	);
}

function ComposeForm({
	round,
	onSubmit,
}: {
	round: number;
	onSubmit: (
		statements: readonly [string, string, string],
		lieIdx: TwoTruthsPick,
	) => void;
}) {
	const [seed, setSeed] = useState(() => round);
	const prompt = useMemo(() => suggestPrompt(seed), [seed]);
	const [statements, setStatements] = useState<[string, string, string]>([
		"",
		"",
		"",
	]);
	const [lieIdx, setLieIdx] = useState<TwoTruthsPick | null>(null);

	const allFilled = statements.every((s) => s.trim().length > 0);
	const canSubmit = allFilled && lieIdx !== null;

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (lieIdx === null) return;
		const trimmed: [string, string, string] = [
			statements[0].trim(),
			statements[1].trim(),
			statements[2].trim(),
		];
		if (trimmed.some((s) => s.length === 0)) return;
		onSubmit(trimmed, lieIdx);
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-3">
			<div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs">
				<Lightbulb
					className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
					aria-hidden
				/>
				<div className="flex min-w-0 flex-1 flex-col gap-0.5">
					<span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
						Prompt
					</span>
					<span className="text-pretty text-foreground">{prompt}</span>
				</div>
				<button
					type="button"
					onClick={() => setSeed((s) => s + 1)}
					className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
				>
					Skip
				</button>
			</div>

			<ul className="flex flex-col gap-2">
				{statements.map((value, i) => {
					const idx = i as TwoTruthsPick;
					const isLie = lieIdx === idx;
					return (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: fixed 3-tuple.
							key={i}
							className="flex items-center gap-2"
						>
							<button
								type="button"
								onClick={() => setLieIdx(idx)}
								aria-pressed={isLie}
								aria-label={`Mark statement ${i + 1} as the lie`}
								className={cn(
									"flex size-8 shrink-0 items-center justify-center rounded-md border text-xs font-semibold tabular-nums transition-colors motion-safe:duration-150 ease-out",
									isLie
										? "border-destructive bg-destructive/10 text-destructive"
										: "border-border bg-card text-muted-foreground hover:border-border/80",
								)}
							>
								{isLie ? <X className="size-3.5" aria-hidden /> : i + 1}
							</button>
							<Input
								value={value}
								onChange={(e) => {
									const next: [string, string, string] = [...statements];
									next[i] = e.target.value.slice(0, TWO_TRUTHS_STATEMENT_MAX);
									setStatements(next);
								}}
								maxLength={TWO_TRUTHS_STATEMENT_MAX}
								placeholder={
									i === 0
										? "Something true..."
										: i === 1
											? "Something else true..."
											: "...and one lie"
								}
								className="h-9 text-sm"
							/>
						</li>
					);
				})}
			</ul>

			<div className="flex items-center justify-between text-[10px] text-muted-foreground">
				<span>
					{lieIdx === null
						? "Tap a number to mark the lie"
						: `Lie: #${lieIdx + 1}`}
				</span>
				<span className="tabular-nums">
					{statements.reduce((n, s) => n + s.length, 0)}/
					{TWO_TRUTHS_STATEMENT_MAX * 3}
				</span>
			</div>

			<Button
				type="submit"
				size="sm"
				disabled={!canSubmit}
				className="gap-2 active:scale-[0.97]"
			>
				<Send className="size-3.5" />
				Send to stranger
			</Button>
		</form>
	);
}

function WaitingForComposer() {
	return (
		<div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground">
			Stranger is writing three statements...
		</div>
	);
}

function GuessingView({
	statements,
	iAmReader,
	guess,
	myTurn,
	onPick,
	lieIdxHint,
	onReveal,
}: {
	statements: readonly [string, string, string];
	iAmReader: boolean;
	guess: TwoTruthsPick | null;
	myTurn: boolean;
	onPick: (idx: TwoTruthsPick) => void;
	lieIdxHint: TwoTruthsPick | null;
	onReveal: () => void;
}) {
	const locked = guess !== null;
	return (
		<div className="flex flex-col gap-3">
			<ul className="flex flex-col gap-2">
				{statements.map((text, i) => {
					const idx = i as TwoTruthsPick;
					const isMyGuess = guess === idx;
					const disabled = iAmReader || locked || !myTurn;

					return (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: fixed 3-tuple.
							key={i}
						>
							<button
								type="button"
								disabled={disabled}
								onClick={() => onPick(idx)}
								aria-pressed={isMyGuess}
								className={cn(
									"flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors motion-safe:duration-150 ease-out",
									"disabled:cursor-not-allowed",
									isMyGuess
										? "border-brand-500 bg-brand-500/10"
										: "border-border bg-card",
									!disabled && "hover:border-border/80 active:scale-[0.99]",
								)}
							>
								<span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border border-border/60 text-xs font-semibold tabular-nums text-muted-foreground">
									{i + 1}
								</span>
								<span className="flex-1 text-pretty text-sm leading-relaxed">
									{text}
								</span>
							</button>
						</li>
					);
				})}
			</ul>

			{iAmReader ? (
				locked ? (
					<div className="flex flex-col items-center gap-2">
						<p className="text-center text-xs text-muted-foreground">
							Stranger picked #{(guess ?? 0) + 1}.
						</p>
						<Button
							size="sm"
							className="gap-2 active:scale-[0.97]"
							onClick={onReveal}
						>
							<Eye className="size-3.5" />
							Reveal the lie
						</Button>
					</div>
				) : (
					<p className="text-center text-xs text-muted-foreground">
						Waiting for stranger to guess...
					</p>
				)
			) : locked ? (
				<p className="text-center text-xs text-muted-foreground">
					Locked in — waiting for reveal...
				</p>
			) : (
				<p className="text-center text-xs text-muted-foreground">
					Which one is the lie?
				</p>
			)}

			{iAmReader && lieIdxHint !== null && !locked && (
				<p className="text-center text-[10px] text-muted-foreground/70">
					(You know: #{lieIdxHint + 1} is the lie)
				</p>
			)}
		</div>
	);
}

function RevealedView({
	statements,
	lieIdx,
	guess,
	onAdvance,
	isLast,
}: {
	statements: readonly [string, string, string];
	lieIdx: TwoTruthsPick;
	guess: TwoTruthsPick | null;
	onAdvance: () => void;
	isLast: boolean;
}) {
	return (
		<div className="flex flex-col gap-3">
			<ul className="flex flex-col gap-2">
				{statements.map((text, i) => {
					const idx = i as TwoTruthsPick;
					const isLie = idx === lieIdx;
					const isGuess = idx === guess;
					return (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: fixed 3-tuple.
							key={i}
							className={cn(
								"flex items-start gap-3 rounded-xl border px-3 py-2.5 text-sm",
								isLie
									? "border-destructive bg-destructive/10"
									: isGuess
										? "border-muted-foreground/40 bg-muted/40 text-muted-foreground"
										: "border-border bg-card text-muted-foreground",
							)}
						>
							<span
								className={cn(
									"mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold tabular-nums",
									isLie
										? "border-destructive bg-destructive/20 text-destructive"
										: "border-border/60 text-muted-foreground",
								)}
							>
								{i + 1}
							</span>
							<span className="flex-1 text-pretty leading-relaxed">{text}</span>
							{isLie && (
								<span className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-destructive">
									<X className="size-3" aria-hidden />
									Lie
								</span>
							)}
							{isGuess && !isLie && (
								<span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
									Guess
								</span>
							)}
						</li>
					);
				})}
			</ul>

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
					const lieText = h.statements[h.correct];
					return (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: round index is stable.
							key={i}
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
