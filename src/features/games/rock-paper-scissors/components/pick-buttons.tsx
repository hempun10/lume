import { cn } from "@/lib/utils";
import {
	RPS_MOVE_PAPER,
	RPS_MOVE_ROCK,
	RPS_MOVE_SCISSORS,
	type RPSPick,
} from "../../engines/rock-paper-scissors";

export function PickButtons({
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
								? "border-primary bg-primary/10"
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
