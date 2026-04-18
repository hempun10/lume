import { cn } from "@/lib/utils";
import {
	pickEmoji,
	pickLabel,
	type RockPaperScissorsState,
} from "../../engines/rock-paper-scissors";

export function FinishedView({
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
