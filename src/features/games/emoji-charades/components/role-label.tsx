import { Eye, MessageCircle } from "lucide-react";

export function RoleLabel({ iAmRevealer }: { iAmRevealer: boolean }) {
	return (
		<div className="flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
			{iAmRevealer ? (
				<>
					<Eye className="size-3" aria-hidden />
					<span>You see the answer — stranger guesses</span>
				</>
			) : (
				<>
					<MessageCircle className="size-3" aria-hidden />
					<span>Decode the emojis — pick the phrase</span>
				</>
			)}
		</div>
	);
}
