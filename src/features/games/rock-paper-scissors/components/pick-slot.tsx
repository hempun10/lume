import { cn } from "@/lib/utils";
import {
	pickEmoji,
	pickLabel,
	type RPSPick,
} from "../../engines/rock-paper-scissors";

export function PickSlot({
	label,
	pick,
	visible,
	accent,
}: {
	label: string;
	pick: RPSPick | null;
	visible: boolean;
	accent: "you" | "them";
}) {
	const empty = pick === null;
	const hidden = pick !== null && !visible;
	return (
		<div
			className={cn(
				"flex flex-col items-center gap-2 rounded-xl border p-4",
				accent === "you"
					? "border-brand-500/30 bg-brand-500/5"
					: "border-border bg-card",
			)}
		>
			<span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
				{label}
			</span>
			<div className="flex h-12 items-center justify-center text-3xl">
				{empty ? (
					<span className="text-muted-foreground/40">—</span>
				) : hidden ? (
					<span className="text-muted-foreground">·</span>
				) : (
					<span role="img" aria-label={pickLabel(pick)}>
						{pickEmoji(pick)}
					</span>
				)}
			</div>
		</div>
	);
}
