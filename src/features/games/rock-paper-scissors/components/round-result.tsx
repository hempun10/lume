import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type RPSPick, roundOutcome } from "../../engines/rock-paper-scissors";

export function RoundResult({
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
					tone === "win" && "text-primary",
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
