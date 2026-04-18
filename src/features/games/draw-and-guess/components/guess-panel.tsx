import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DrawAndGuessPick } from "../../engines/draw-and-guess";

export function GuessPanel({
	options,
	iAmDrawer,
	guess,
	revealed,
	correctIdx,
	myTurn,
	onGuess,
}: {
	options: readonly [string, string, string, string];
	iAmDrawer: boolean;
	guess: DrawAndGuessPick | null;
	revealed: boolean;
	correctIdx: DrawAndGuessPick | null;
	myTurn: boolean;
	onGuess: (idx: DrawAndGuessPick) => void;
}) {
	return (
		<ul className="grid grid-cols-2 gap-2">
			{options.map((text, i) => {
				const idx = i as DrawAndGuessPick;
				const isGuess = guess === idx;
				const isCorrect = revealed && correctIdx === idx;
				const isWrongGuess = revealed && isGuess && !isCorrect;
				const disabled = iAmDrawer || revealed || guess !== null || !myTurn;

				let tone = "border-border bg-card text-foreground";
				if (isCorrect)
					tone = "border-brand-500 bg-brand-500/10 text-foreground";
				else if (isWrongGuess)
					tone = "border-destructive bg-destructive/10 text-destructive";
				else if (!revealed && isGuess)
					tone = "border-brand-500 bg-brand-500/10 text-foreground";

				return (
					<li
						// biome-ignore lint/suspicious/noArrayIndexKey: fixed 4-tuple.
						key={i}
					>
						<button
							type="button"
							disabled={disabled}
							onClick={() => onGuess(idx)}
							aria-pressed={isGuess}
							className={cn(
								"flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors motion-safe:duration-150 ease-out",
								"disabled:cursor-not-allowed",
								tone,
								!disabled && "hover:border-border/80 active:scale-[0.99]",
							)}
						>
							<span className="truncate">{text}</span>
							{isCorrect && (
								<Check className="size-4 shrink-0 text-brand-500" aria-hidden />
							)}
							{isWrongGuess && (
								<X className="size-4 shrink-0 text-destructive" aria-hidden />
							)}
						</button>
					</li>
				);
			})}
		</ul>
	);
}
