import { Eye, MessageCircle } from "lucide-react";
import type { TwoTruthsState } from "../../engines/two-truths";

export function RoleLabel({
	iAmReader,
	phase,
}: {
	iAmReader: boolean;
	phase: TwoTruthsState["phase"];
}) {
	let text: string;
	let Icon = iAmReader ? Eye : MessageCircle;
	if (iAmReader) {
		if (phase === "composing") text = "Your turn — write 2 truths + 1 lie";
		else if (phase === "guessing") text = "Stranger is guessing...";
		else text = "You read this round";
		Icon = Eye;
	} else {
		if (phase === "composing") text = "Stranger is writing...";
		else if (phase === "guessing") text = "Spot the lie";
		else text = "You guessed this round";
		Icon = MessageCircle;
	}
	return (
		<div className="flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
			<Icon className="size-3" aria-hidden />
			<span>{text}</span>
		</div>
	);
}
