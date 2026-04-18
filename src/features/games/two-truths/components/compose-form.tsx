import { Lightbulb, Send, X } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { suggestPrompt } from "../../data/two-truths-prompts";
import {
	TWO_TRUTHS_STATEMENT_MAX,
	type TwoTruthsPick,
} from "../../engines/two-truths";

export function ComposeForm({
	round,
	onSubmit,
}: {
	round: number;
	onSubmit: (
		statements: readonly [string, string, string],
		lieIdx: TwoTruthsPick,
	) => void;
}) {
	const [seed, setSeed] = useState(() => round);
	const prompt = useMemo(() => suggestPrompt(seed), [seed]);
	const [statements, setStatements] = useState<[string, string, string]>([
		"",
		"",
		"",
	]);
	const [lieIdx, setLieIdx] = useState<TwoTruthsPick | null>(null);

	const allFilled = statements.every((s) => s.trim().length > 0);
	const canSubmit = allFilled && lieIdx !== null;

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (lieIdx === null) return;
		const trimmed: [string, string, string] = [
			statements[0].trim(),
			statements[1].trim(),
			statements[2].trim(),
		];
		if (trimmed.some((s) => s.length === 0)) return;
		onSubmit(trimmed, lieIdx);
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-3">
			<div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs">
				<Lightbulb
					className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
					aria-hidden
				/>
				<div className="flex min-w-0 flex-1 flex-col gap-0.5">
					<span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
						Prompt
					</span>
					<span className="text-pretty text-foreground">{prompt}</span>
				</div>
				<button
					type="button"
					onClick={() => setSeed((s) => s + 1)}
					className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
				>
					Skip
				</button>
			</div>

			<div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
				<span>Your 2 truths + 1 lie</span>
				<span
					className={cn(
						"transition-colors",
						lieIdx === null ? "text-destructive/80" : "text-muted-foreground",
					)}
				>
					{lieIdx === null ? "Tap a number to mark the lie" : "Ready to send"}
				</span>
			</div>

			<ul className="flex flex-col gap-2">
				{statements.map((value, i) => {
					const idx = i as TwoTruthsPick;
					const isLie = lieIdx === idx;
					return (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: fixed 3-tuple.
							key={i}
							className="flex items-center gap-2"
						>
							<button
								type="button"
								onClick={() => setLieIdx(idx)}
								aria-pressed={isLie}
								aria-label={`Mark statement ${i + 1} as the lie`}
								title={isLie ? "This is the lie" : "Tap to mark as the lie"}
								className={cn(
									"flex size-9 shrink-0 items-center justify-center rounded-md border text-xs font-semibold tabular-nums transition-colors motion-safe:duration-150 ease-out",
									isLie
										? "border-destructive bg-destructive text-destructive-foreground"
										: lieIdx === null
											? "border-dashed border-muted-foreground/50 bg-card text-muted-foreground hover:border-destructive/60 hover:text-destructive"
											: "border-border bg-card text-muted-foreground hover:border-border/80",
								)}
							>
								{isLie ? <X className="size-4" aria-hidden /> : i + 1}
							</button>
							<Input
								value={value}
								onChange={(e) => {
									const next: [string, string, string] = [...statements];
									next[i] = e.target.value.slice(0, TWO_TRUTHS_STATEMENT_MAX);
									setStatements(next);
								}}
								maxLength={TWO_TRUTHS_STATEMENT_MAX}
								placeholder={
									i === 0
										? "Something true..."
										: i === 1
											? "Something else true..."
											: "...and one lie"
								}
								className="h-9 text-sm"
							/>
						</li>
					);
				})}
			</ul>

			{lieIdx === null && allFilled && (
				<p className="-mt-1 text-center text-xs font-medium text-destructive">
					Tap one of the numbers on the left to mark the lie
				</p>
			)}

			<div className="flex items-center justify-between text-[10px] text-muted-foreground">
				<span>
					{lieIdx === null
						? "Which one is the lie?"
						: `Lie marked: #${lieIdx + 1}`}
				</span>
				<span className="tabular-nums">
					{statements.reduce((n, s) => n + s.length, 0)}/
					{TWO_TRUTHS_STATEMENT_MAX * 3}
				</span>
			</div>

			<Button
				type="submit"
				size="sm"
				disabled={!canSubmit}
				className="gap-2 active:scale-[0.97]"
			>
				<Send className="size-3.5" />
				{!allFilled
					? "Fill in all three statements"
					: lieIdx === null
						? "Mark the lie to continue"
						: "Send to stranger"}
			</Button>
		</form>
	);
}
