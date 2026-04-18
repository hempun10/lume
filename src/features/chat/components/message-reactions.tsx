import { cn } from "@/lib/utils";

interface MessageReactionsProps {
	reactions: Record<string, string[]>;
	userId: string;
	alignRight?: boolean;
	onToggle: (emoji: string) => void;
}

/**
 * Compact chip row rendered beneath a message bubble. Each chip shows
 * the emoji and the count of users that reacted with it; a chip is
 * highlighted when the current user's id is among those reactions, so
 * clicking it again removes their reaction.
 */
export function MessageReactions({
	reactions,
	userId,
	alignRight,
	onToggle,
}: MessageReactionsProps) {
	const entries = Object.entries(reactions).filter(
		([, users]) => users.length > 0,
	);

	if (entries.length === 0) return null;

	return (
		<div
			className={cn(
				"mt-1 flex flex-wrap gap-1",
				alignRight ? "justify-end" : "justify-start",
			)}
		>
			{entries.map(([emoji, users]) => {
				const isMine = users.includes(userId);
				return (
					<button
						key={emoji}
						type="button"
						onClick={() => onToggle(emoji)}
						className={cn(
							"flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs leading-none transition-colors",
							isMine
								? "border-primary/40 bg-primary/15 text-primary"
								: "border-border/60 bg-muted/70 text-muted-foreground hover:bg-muted",
						)}
						aria-label={`${emoji} reaction (${users.length}). ${
							isMine ? "Click to remove your reaction." : "Click to react."
						}`}
					>
						<span className="text-sm leading-none">{emoji}</span>
						<span className="tabular-nums">{users.length}</span>
					</button>
				);
			})}
		</div>
	);
}
