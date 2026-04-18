import { ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TwoTruthsPick } from "../../engines/two-truths";

export function RevealedView({
	statements,
	lieIdx,
	guess,
	onAdvance,
	isLast,
}: {
	statements: readonly [string, string, string];
	lieIdx: TwoTruthsPick;
	guess: TwoTruthsPick | null;
	onAdvance: () => void;
	isLast: boolean;
}) {
	return (
		<div className="flex flex-col gap-3">
			<ul className="flex flex-col gap-2">
				{statements.map((text, i) => {
					const idx = i as TwoTruthsPick;
					const isLie = idx === lieIdx;
					const isGuess = idx === guess;
					return (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: fixed 3-tuple.
							key={i}
							className={cn(
								"flex items-start gap-3 rounded-xl border px-3 py-2.5 text-sm",
								isLie
									? "border-destructive bg-destructive/10"
									: isGuess
										? "border-muted-foreground/40 bg-muted/40 text-muted-foreground"
										: "border-border bg-card text-muted-foreground",
							)}
						>
							<span
								className={cn(
									"mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold tabular-nums",
									isLie
										? "border-destructive bg-destructive/20 text-destructive"
										: "border-border/60 text-muted-foreground",
								)}
							>
								{i + 1}
							</span>
							<span className="flex-1 text-pretty leading-relaxed">{text}</span>
							{isLie && (
								<span className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-destructive">
									<X className="size-3" aria-hidden />
									Lie
								</span>
							)}
							{isGuess && !isLie && (
								<span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
									Guess
								</span>
							)}
						</li>
					);
				})}
			</ul>

			<div className="flex justify-center">
				<Button
					size="sm"
					className="gap-2 active:scale-[0.97]"
					onClick={onAdvance}
				>
					{isLast ? "See results" : "Next round"}
					<ChevronRight className="size-3.5" />
				</Button>
			</div>
		</div>
	);
}
