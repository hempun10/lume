import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	pickEmoji,
	pickLabel,
	type RockPaperScissorsState,
	RPS_MOVE_ADVANCE,
	RPS_MOVE_PAPER,
	RPS_MOVE_ROCK,
	RPS_MOVE_SCISSORS,
	type RPSPick,
	roundOutcome,
} from "../engines/rock-paper-scissors";

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

function ScoreBar({
	myWins,
	theirWins,
	threshold,
}: {
	myWins: number;
	theirWins: number;
	threshold: number;
}) {
	return (
		<div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
			<span className="font-medium text-foreground tabular-nums">
				You {myWins}
			</span>
			<span className="text-border">vs</span>
			<span className="tabular-nums">Stranger {theirWins}</span>
			<span className="text-border">·</span>
			<span className="tabular-nums">first to {threshold}</span>
		</div>
	);
}

function PickSlot({
	label,
	pick,
	visible,
	accent,
}: {
	label: string;
	pick: RPSPick | null;
	visible: boolean;
	accent: "you" | "them";
}) {
	const empty = pick === null;
	const hidden = pick !== null && !visible;
	return (
		<div
			className={cn(
				"flex flex-col items-center gap-2 rounded-xl border p-4",
				accent === "you"
					? "border-brand-500/30 bg-brand-500/5"
					: "border-border bg-card",
			)}
		>
			<span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
				{label}
			</span>
			<div className="flex h-12 items-center justify-center text-3xl">
				{empty ? (
					<span className="text-muted-foreground/40">—</span>
				) : hidden ? (
					<span className="text-muted-foreground">·</span>
				) : (
					<span role="img" aria-label={pickLabel(pick)}>
						{pickEmoji(pick)}
					</span>
				)}
			</div>
		</div>
	);
}

function PickButtons({
	disabled,
	onPick,
	myPick,
}: {
	disabled: boolean;
	onPick: (pick: number) => void;
	myPick: RPSPick | null;
}) {
	const options: Array<{ value: RPSPick; label: string; emoji: string }> = [
		{ value: RPS_MOVE_ROCK, label: "Rock", emoji: "🪨" },
		{ value: RPS_MOVE_PAPER, label: "Paper", emoji: "📄" },
		{ value: RPS_MOVE_SCISSORS, label: "Scissors", emoji: "✂️" },
	];
	return (
		<div className="grid grid-cols-3 gap-2">
			{options.map((o) => {
				const selected = myPick === o.value;
				return (
					<button
						key={o.value}
						type="button"
						disabled={disabled}
						onClick={() => onPick(o.value)}
						aria-label={o.label}
						aria-pressed={selected}
						className={cn(
							"flex flex-col items-center gap-1 rounded-xl border px-2 py-3 transition-colors motion-safe:duration-150 ease-out",
							"disabled:cursor-not-allowed disabled:opacity-50",
							selected
								? "border-brand-500 bg-brand-500/10"
								: "border-border bg-card hover:border-border/80",
							!disabled && "active:scale-[0.97]",
						)}
					>
						<span className="text-2xl">{o.emoji}</span>
						<span className="text-[10px] font-medium text-muted-foreground">
							{o.label}
						</span>
					</button>
				);
			})}
		</div>
	);
}

function RoundResult({
	mySeat,
	myPick,
	theirPick,
	isLast,
	onAdvance,
}: {
	mySeat: "A" | "B";
	myPick: RPSPick;
	theirPick: RPSPick;
	isLast: boolean;
	onAdvance: () => void;
}) {
	const aPick = mySeat === "A" ? myPick : theirPick;
	const bPick = mySeat === "A" ? theirPick : myPick;
	const outcome = roundOutcome(aPick, bPick);
	let verdict: string;
	let tone: "win" | "lose" | "tie";
	if (outcome === "tie") {
		verdict = "Tie — replay";
		tone = "tie";
	} else if (
		(outcome === "a" && mySeat === "A") ||
		(outcome === "b" && mySeat === "B")
	) {
		verdict = "You win this round";
		tone = "win";
	} else {
		verdict = "They got you";
		tone = "lose";
	}
	return (
		<div className="flex flex-col items-center gap-2">
			<p
				className={cn(
					"text-sm font-semibold",
					tone === "win" && "text-brand-500",
					tone === "lose" && "text-destructive",
					tone === "tie" && "text-muted-foreground",
				)}
			>
				{verdict}
			</p>
			<Button
				size="sm"
				className="gap-2 active:scale-[0.97]"
				onClick={onAdvance}
			>
				{isLast ? "See results" : "Next round"}
				<ChevronRight className="size-3.5" />
			</Button>
		</div>
	);
}

function FinishedView({
	state,
	mySeat,
	myWins,
	theirWins,
	iWon,
}: {
	state: RockPaperScissorsState;
	mySeat: "A" | "B";
	myWins: number;
	theirWins: number;
	iWon: boolean;
}) {
	return (
		<div className="flex w-full max-w-sm flex-col items-stretch gap-4">
			<div className="flex flex-col items-center gap-1">
				<p className="text-xs uppercase tracking-wide text-muted-foreground">
					{iWon ? "You won" : "You lost"}
				</p>
				<p className="text-balance text-center text-2xl font-semibold tabular-nums">
					{myWins} — {theirWins}
				</p>
			</div>

			<ul className="flex flex-col gap-1.5">
				{state.history.map((h, i) => {
					const myPick = mySeat === "A" ? h.aPick : h.bPick;
					const theirPick = mySeat === "A" ? h.bPick : h.aPick;
					let outcome: "win" | "lose" | "tie";
					if (h.outcome === "tie") outcome = "tie";
					else if (
						(h.outcome === "a" && mySeat === "A") ||
						(h.outcome === "b" && mySeat === "B")
					)
						outcome = "win";
					else outcome = "lose";

					return (
						<li
							key={`${i}-${h.aPick}-${h.bPick}`}
							className={cn(
								"flex items-center justify-between rounded-lg border px-3 py-2 text-xs",
								outcome === "win" && "border-brand-500/40 bg-brand-500/5",
								outcome === "lose" && "border-destructive/30 bg-destructive/5",
								outcome === "tie" && "border-border bg-card",
							)}
						>
							<span className="tabular-nums text-muted-foreground">
								Round {i + 1}
							</span>
							<span className="flex items-center gap-2 text-base">
								<span role="img" aria-label={pickLabel(myPick)}>
									{pickEmoji(myPick)}
								</span>
								<span className="text-xs text-muted-foreground">vs</span>
								<span role="img" aria-label={pickLabel(theirPick)}>
									{pickEmoji(theirPick)}
								</span>
							</span>
							<span
								className={cn(
									"text-xs font-medium",
									outcome === "win" && "text-brand-500",
									outcome === "lose" && "text-destructive",
									outcome === "tie" && "text-muted-foreground",
								)}
							>
								{outcome === "win"
									? "Win"
									: outcome === "lose"
										? "Loss"
										: "Tie"}
							</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
