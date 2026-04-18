import { cn } from "@/lib/utils";
import type { DrawAndGuessDifficulty } from "../../data/draw-and-guess-words";

export function DifficultyPill({ tier }: { tier: DrawAndGuessDifficulty }) {
	const label = tier[0].toUpperCase() + tier.slice(1);
	return (
		<output
			className={cn(
				"shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
				tier === "easy" && "border-brand-500/40 bg-brand-500/5 text-brand-500",
				tier === "medium" &&
					"border-amber-500/40 bg-amber-500/5 text-amber-500",
				tier === "hard" &&
					"border-destructive/40 bg-destructive/5 text-destructive",
			)}
			aria-label={`Difficulty: ${label}`}
		>
			{label}
		</output>
	);
}
