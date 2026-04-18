import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EMOJI_CHARADES_PHRASES } from "../../data/emoji-charades-phrases";
import type { EmojiCharadesState } from "../../engines/emoji-charades";

export function FinishedView({
	state,
	mySeat,
	myScore,
	theirScore,
}: {
	state: EmojiCharadesState;
	mySeat: "A" | "B";
	myScore: number;
	theirScore: number;
}) {
	let tagline: string;
	let tone: "win" | "lose" | "tie";
	if (myScore > theirScore) {
		tagline = "You decoded more clues";
		tone = "win";
	} else if (myScore < theirScore) {
		tagline = "Stranger read the emojis better";
		tone = "lose";
	} else {
		tagline = "Tie — equally fluent in emoji";
		tone = "tie";
	}

	return (
		<div className="flex w-full max-w-md flex-col items-stretch gap-4">
			<div className="flex flex-col items-center gap-1">
				<p
					className={cn(
						"text-xs uppercase tracking-wide",
						tone === "win" && "text-brand-500",
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
					const iGuessed = h.revealerSeat !== mySeat;
					const got = h.guess === h.correct;
					const phrase = EMOJI_CHARADES_PHRASES[h.phraseIdx];
					return (
						<li
							key={`${i}-${h.phraseIdx}`}
							className={cn(
								"flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs",
								iGuessed && got && "border-brand-500/40 bg-brand-500/5",
								iGuessed && !got && "border-destructive/30 bg-destructive/5",
								!iGuessed && "border-border bg-card",
							)}
						>
							<span className="flex min-w-0 flex-1 items-center gap-2">
								<span className="shrink-0 text-base leading-none">
									{phrase?.emojis ?? ""}
								</span>
								<span className="truncate text-foreground">
									{phrase?.phrase ?? "(missing)"}
								</span>
							</span>
							<span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wide">
								{iGuessed ? (
									got ? (
										<span className="flex items-center gap-1 text-brand-500">
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
									<span className="text-muted-foreground">You revealed</span>
								)}
							</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
