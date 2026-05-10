import { Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Seat } from "../engines/types";
import {
	agreementCount,
	currentPrompt,
	type WouldYouRatherState,
	WYR_MOVE_ADVANCE,
	WYR_MOVE_PICK_LEFT,
	WYR_MOVE_PICK_RIGHT,
} from "../engines/would-you-rather";

interface Props {
	state: WouldYouRatherState;
	mySeat: Seat;
	myTurn: boolean;
	onMove: (move: number) => void;
}

/**
 * Would You Rather board.
 *
 * Renders one of three phase-dependent views:
 *  - picking: prompt + two option cards, highlights the seat's own
 *    pick once submitted, shows "Waiting for partner..." while the
 *    other seat hasn't picked.
 *  - revealed: both picks shown on their respective options, "Next"
 *    button advances to the next prompt.
 *  - finished: agreement tally over all N prompts + a mini history.
 */
export function WouldYouRatherBoard({ state, mySeat, myTurn, onMove }: Props) {
	if (state.phase === "finished") {
		return <FinishedView state={state} />;
	}

	const prompt = currentPrompt(state);
	if (!prompt) return null;

	const revealed = state.phase === "revealed";
	// In picking phase, lock the options once this seat has picked.
	// In revealed phase, options are display-only.
	const optionsDisabled = revealed || !myTurn;

	// During picking, only the viewer's own pick should highlight.
	// Opponent's pick stays hidden until both have committed.
	const myPick = mySeat === "A" ? state.aPick : state.bPick;
	const opponentPick = mySeat === "A" ? state.bPick : state.aPick;

	return (
		<div className="flex w-full max-w-sm flex-col items-stretch gap-4">
			<div className="flex items-center justify-between text-xs text-muted-foreground">
				<span className="tabular-nums">
					Round {state.round + 1} of {state.totalRounds}
				</span>
				<span className="text-pretty">
					{revealed ? "Revealed" : "Pick one"}
				</span>
			</div>

			<OptionCard
				label={prompt.left}
				myPicked={myPick === 0}
				opponentPicked={opponentPick === 0}
				revealed={revealed}
				disabled={optionsDisabled}
				onPick={() => onMove(WYR_MOVE_PICK_LEFT)}
			/>

			<div className="flex items-center justify-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
				or
			</div>

			<OptionCard
				label={prompt.right}
				myPicked={myPick === 1}
				opponentPicked={opponentPick === 1}
				revealed={revealed}
				disabled={optionsDisabled}
				onPick={() => onMove(WYR_MOVE_PICK_RIGHT)}
			/>

			{revealed ? (
				<Button
					size="sm"
					className="mt-2 gap-2 active:scale-[0.97]"
					onClick={() => onMove(WYR_MOVE_ADVANCE)}
				>
					{state.round + 1 >= state.totalRounds ? "See results" : "Next prompt"}
					<ChevronRight className="size-3.5" />
				</Button>
			) : (
				<WaitingHint myTurn={myTurn} />
			)}
		</div>
	);
}

function OptionCard({
	label,
	myPicked,
	opponentPicked,
	revealed,
	disabled,
	onPick,
}: {
	label: string;
	myPicked: boolean;
	/** Opponent's pick is only visible (both to styling and badges) once revealed. */
	opponentPicked: boolean;
	revealed: boolean;
	disabled: boolean;
	onPick: () => void;
}) {
	// Before reveal, only the viewer's own pick highlights. This prevents
	// leaking the opponent's choice during the simultaneous picking phase.
	const highlighted = myPicked || (revealed && opponentPicked);
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onPick}
			className={cn(
				"group relative rounded-xl border p-4 text-left transition-colors motion-safe:duration-150 ease-out",
				"disabled:cursor-not-allowed",
				highlighted
					? "border-primary bg-primary/5"
					: "border-border bg-card hover:border-border/80",
				!disabled && "active:scale-[0.98]",
			)}
		>
			<p className="text-pretty text-sm font-medium text-foreground">{label}</p>

			{revealed && (
				<div className="mt-3 flex flex-wrap gap-1.5">
					{myPicked && <PickBadge who="You" />}
					{opponentPicked && <PickBadge who="Stranger" />}
				</div>
			)}
		</button>
	);
}

function PickBadge({ who }: { who: "You" | "Stranger" }) {
	return (
		<span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
			<Check className="size-3" />
			{who}
		</span>
	);
}

function WaitingHint({ myTurn }: { myTurn: boolean }) {
	return (
		<p className="text-center text-xs text-muted-foreground">
			{myTurn ? "Pick one to continue" : "Waiting for partner..."}
		</p>
	);
}

function FinishedView({ state }: { state: WouldYouRatherState }) {
	const agreed = agreementCount(state);
	const total = state.history.length;
	return (
		<div className="flex w-full max-w-sm flex-col items-stretch gap-4">
			<div className="flex flex-col items-center gap-1">
				<p className="text-xs uppercase tracking-wide text-muted-foreground">
					Results
				</p>
				<p className="text-balance text-center text-2xl font-semibold tabular-nums">
					{agreed} / {total} matched
				</p>
				<p className="text-pretty text-center text-xs text-muted-foreground">
					{matchBlurb(agreed, total)}
				</p>
			</div>

			<ul className="flex flex-col gap-1.5">
				{state.history.map((h, i) => {
					const match = h.aPick === h.bPick;
					return (
						<li
							key={`${h.promptIdx}-${i}`}
							className={cn(
								"flex items-center justify-between rounded-lg border px-3 py-2 text-xs",
								match
									? "border-primary/40 bg-primary/5 text-foreground"
									: "border-border bg-card text-muted-foreground",
							)}
						>
							<span className="tabular-nums">Round {i + 1}</span>
							<span>{match ? "Matched" : "Different"}</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
}

function matchBlurb(agreed: number, total: number): string {
	if (total === 0) return "No rounds played.";
	const ratio = agreed / total;
	if (ratio === 1) return "Soulmates unlocked.";
	if (ratio >= 0.75) return "Wavelength matches.";
	if (ratio >= 0.5) return "More similar than different.";
	if (ratio >= 0.25) return "Opposites attract maybe?";
	return "Completely different energy.";
}
