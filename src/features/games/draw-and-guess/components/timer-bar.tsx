import { cn } from "@/lib/utils";
import { DRAW_AND_GUESS_ROUND_DURATION_MS } from "../../engines/draw-and-guess";

export function TimerBar({
	remainingMs,
	revealed,
}: {
	remainingMs: number;
	revealed: boolean;
}) {
	const seconds = Math.ceil(remainingMs / 1000);
	const pct = revealed ? 0 : remainingMs / DRAW_AND_GUESS_ROUND_DURATION_MS;
	const danger = !revealed && seconds <= 10;
	return (
		<div className="flex items-center gap-2">
			<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
				<div
					className={cn(
						"h-full rounded-full transition-[width] duration-200 ease-linear",
						danger ? "bg-destructive" : "bg-brand-500",
					)}
					style={{ width: `${pct * 100}%` }}
				/>
			</div>
			<span
				className={cn(
					"w-8 shrink-0 text-right text-xs font-semibold tabular-nums",
					danger ? "text-destructive" : "text-muted-foreground",
				)}
			>
				{revealed ? "—" : `${seconds}s`}
			</span>
		</div>
	);
}
