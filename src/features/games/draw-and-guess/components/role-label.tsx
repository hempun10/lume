import { Eye, Paintbrush } from "lucide-react";
import type { DrawAndGuessState } from "../../engines/draw-and-guess";

export function RoleLabel({
	iAmDrawer,
	phase,
}: {
	iAmDrawer: boolean;
	phase: DrawAndGuessState["phase"];
}) {
	let text: string;
	const Icon = iAmDrawer ? Paintbrush : Eye;
	if (iAmDrawer) {
		text =
			phase === "setup"
				? "You're drawing this round"
				: phase === "drawing"
					? "Draw the word — stranger is guessing"
					: "You drew this round";
	} else {
		text =
			phase === "setup"
				? "Stranger is drawing this round"
				: phase === "drawing"
					? "Watch and guess what they're drawing"
					: "You guessed this round";
	}
	return (
		<div className="flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
			<Icon className="size-3" aria-hidden />
			<span>{text}</span>
		</div>
	);
}
