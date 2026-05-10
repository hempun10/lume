import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EmojiCharadesPick } from "../../engines/emoji-charades";

export function OptionsList({
	round,
	options,
	correctIdx,
	guess,
	revealed,
	iAmRevealer,
	locked,
	myTurn,
	onPick,
}: {
	round: number;
	options: readonly string[];
	correctIdx: EmojiCharadesPick;
	guess: EmojiCharadesPick | null;
	revealed: boolean;
	iAmRevealer: boolean;
	locked: boolean;
	myTurn: boolean;
	onPick: (idx: EmojiCharadesPick) => void;
}) {
	return (
		<ul className="flex flex-col gap-2">
			{options.map((text, i) => {
				const idx = i as EmojiCharadesPick;
				const isMyGuess = guess === idx;
				const isCorrect = idx === correctIdx;

				let border = "border-border";
				let bg = "bg-card";
				let tone = "text-foreground";
				if (revealed) {
					if (isCorrect) {
						border = "border-primary";
						bg = "bg-primary/10";
					} else if (isMyGuess) {
						border = "border-destructive";
						bg = "bg-destructive/10";
						tone = "text-muted-foreground";
					} else {
						tone = "text-muted-foreground";
					}
				} else if (isMyGuess) {
					border = "border-primary";
					bg = "bg-primary/10";
				}

				const disabled = iAmRevealer || revealed || locked || !myTurn;

				return (
					<li key={`${round}-${i}-${text}`}>
						<button
							type="button"
							disabled={disabled}
							onClick={() => onPick(idx)}
							aria-pressed={isMyGuess}
							className={cn(
								"flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors motion-safe:duration-150 ease-out",
								"disabled:cursor-not-allowed",
								border,
								bg,
								tone,
								!disabled && "hover:border-border/80 active:scale-[0.99]",
							)}
						>
							<span
								className={cn(
									"flex size-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold tabular-nums",
									revealed && isCorrect
										? "border-primary bg-primary/20 text-primary"
										: "border-border/60 text-muted-foreground",
								)}
							>
								{String.fromCharCode(65 + i)}
							</span>
							<span className="flex-1 text-pretty text-sm leading-relaxed">
								{text}
							</span>
							{revealed && isCorrect && (
								<span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
									<Check className="size-3" aria-hidden />
									Answer
								</span>
							)}
							{revealed && isMyGuess && !isCorrect && (
								<span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-destructive">
									<X className="size-3" aria-hidden />
									Your pick
								</span>
							)}
						</button>
					</li>
				);
			})}
		</ul>
	);
}
