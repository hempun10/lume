import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TwoTruthsPick } from "../../engines/two-truths";

export function GuessingView({
	statements,
	iAmReader,
	guess,
	myTurn,
	onPick,
	lieIdxHint,
	onReveal,
}: {
	statements: readonly [string, string, string];
	iAmReader: boolean;
	guess: TwoTruthsPick | null;
	myTurn: boolean;
	onPick: (idx: TwoTruthsPick) => void;
	lieIdxHint: TwoTruthsPick | null;
	onReveal: () => void;
}) {
	const locked = guess !== null;
	return (
		<div className="flex flex-col gap-3">
			<ul className="flex flex-col gap-2">
				{statements.map((text, i) => {
					const idx = i as TwoTruthsPick;
					const isMyGuess = guess === idx;
					const disabled = iAmReader || locked || !myTurn;

					return (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: fixed 3-tuple.
							key={i}
						>
							<button
								type="button"
								disabled={disabled}
								onClick={() => onPick(idx)}
								aria-pressed={isMyGuess}
								className={cn(
									"flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors motion-safe:duration-150 ease-out",
									"disabled:cursor-not-allowed",
									isMyGuess
										? "border-brand-500 bg-brand-500/10"
										: "border-border bg-card",
									!disabled && "hover:border-border/80 active:scale-[0.99]",
								)}
							>
								<span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border border-border/60 text-xs font-semibold tabular-nums text-muted-foreground">
									{i + 1}
								</span>
								<span className="flex-1 text-pretty text-sm leading-relaxed">
									{text}
								</span>
							</button>
						</li>
					);
				})}
			</ul>

			{iAmReader ? (
				locked ? (
					<div className="flex flex-col items-center gap-2">
						<p className="text-center text-xs text-muted-foreground">
							Stranger picked #{(guess ?? 0) + 1}.
						</p>
						<Button
							size="sm"
							className="gap-2 active:scale-[0.97]"
							onClick={onReveal}
						>
							<Eye className="size-3.5" />
							Reveal the lie
						</Button>
					</div>
				) : (
					<p className="text-center text-xs text-muted-foreground">
						Waiting for stranger to guess...
					</p>
				)
			) : locked ? (
				<p className="text-center text-xs text-muted-foreground">
					Locked in — waiting for reveal...
				</p>
			) : (
				<p className="text-center text-xs text-muted-foreground">
					Which one is the lie?
				</p>
			)}

			{iAmReader && lieIdxHint !== null && !locked && (
				<p className="text-center text-[10px] text-muted-foreground/70">
					(You know: #{lieIdxHint + 1} is the lie)
				</p>
			)}
		</div>
	);
}
