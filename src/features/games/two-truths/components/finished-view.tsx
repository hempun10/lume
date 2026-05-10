import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TwoTruthsState } from "../../engines/two-truths";

export function FinishedView({
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
					const iGuessed = h.readerSeat !== mySeat;
					const got = h.guess === h.correct;
					const lieText = h.statements[h.correct];
					return (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: round index is stable.
							key={i}
							className={cn(
								"flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs",
								iGuessed && got && "border-primary/40 bg-primary/5",
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
										<span className="flex items-center gap-1 text-primary">
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
