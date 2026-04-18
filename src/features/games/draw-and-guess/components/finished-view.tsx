import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DrawAndGuessState } from "../../engines/draw-and-guess";
import { DifficultyPill } from "./difficulty-pill";

export function FinishedView({
	state,
	mySeat,
	myScore,
	theirScore,
}: {
	state: DrawAndGuessState;
	mySeat: "A" | "B";
	myScore: number;
	theirScore: number;
}) {
	let tagline: string;
	let tone: "win" | "lose" | "tie";
	if (myScore > theirScore) {
		tagline = "Sharp eyes + steady hand";
		tone = "win";
	} else if (myScore < theirScore) {
		tagline = "Stranger drew circles around you";
		tone = "lose";
	} else {
		tagline = "Matched — both halves pulled their weight";
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
					const iDrew = h.drawerSeat === mySeat;
					const correctWord = h.options[h.correctIdx];
					const got = h.guess === h.correctIdx;
					const scored = got;
					return (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: round index is stable.
							key={i}
							className={cn(
								"flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs",
								scored && "border-brand-500/40 bg-brand-500/5",
								!scored && "border-destructive/30 bg-destructive/5",
							)}
						>
							<span className="flex min-w-0 flex-1 items-center gap-2">
								<DifficultyPill tier={h.difficulty} />
								<span className="min-w-0 flex-1 truncate text-muted-foreground">
									<span className="text-[10px] uppercase tracking-wide">
										{iDrew ? "You drew" : "Stranger drew"}
									</span>{" "}
									<span className="text-foreground">{correctWord}</span>
								</span>
							</span>
							<span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wide">
								{scored ? (
									<span className="flex items-center gap-1 text-brand-500">
										<Check className="size-3" aria-hidden />
										+1 each
									</span>
								) : (
									<span className="flex items-center gap-1 text-destructive">
										<X className="size-3" aria-hidden />
										Missed
									</span>
								)}
							</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
