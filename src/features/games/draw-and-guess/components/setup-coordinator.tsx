import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
	type DrawAndGuessDifficulty,
	pickRoundOptions,
} from "../../data/draw-and-guess-words";
import type { DrawAndGuessPick } from "../../engines/draw-and-guess";
import { DIFFICULTY_TIERS } from "../constants";

export function SetupCoordinator({
	iAmDrawer,
	onDrawerReady,
}: {
	iAmDrawer: boolean;
	onDrawerReady: (
		options: readonly [string, string, string, string],
		correctIdx: DrawAndGuessPick,
		word: string,
		difficulty: DrawAndGuessDifficulty,
	) => void;
}) {
	// Drawer taps a tier. We gate with a ref so rapid re-renders or
	// a second tap can't fire the callback twice.
	const calledRef = useRef(false);
	const [pending, setPending] = useState<DrawAndGuessDifficulty | null>(null);

	const pick = useCallback(
		(difficulty: DrawAndGuessDifficulty) => {
			if (calledRef.current) return;
			calledRef.current = true;
			setPending(difficulty);
			const { options, correctIdx } = pickRoundOptions(difficulty);
			onDrawerReady(options, correctIdx, options[correctIdx], difficulty);
		},
		[onDrawerReady],
	);

	if (!iAmDrawer) {
		return (
			<div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground">
				Stranger is choosing difficulty...
			</div>
		);
	}

	if (pending) {
		return (
			<div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground">
				Picking a {pending} word...
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-4">
			<p className="text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
				Pick a difficulty
			</p>
			<div className="grid grid-cols-3 gap-2">
				{DIFFICULTY_TIERS.map((t) => (
					<button
						key={t.id}
						type="button"
						onClick={() => pick(t.id)}
						className={cn(
							"flex flex-col items-center gap-0.5 rounded-lg border border-border bg-background px-2 py-2.5",
							"text-xs font-semibold text-foreground transition-colors motion-safe:duration-150 ease-out",
							"hover:border-brand-500/50 hover:bg-brand-500/5 active:scale-[0.98]",
						)}
					>
						<span>{t.label}</span>
						<span className="text-[10px] font-normal text-muted-foreground">
							{t.blurb}
						</span>
					</button>
				))}
			</div>
		</div>
	);
}
