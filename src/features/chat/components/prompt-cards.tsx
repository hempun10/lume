import { MessageCircle } from "lucide-react";
import { useMemo } from "react";
import { generatePrompts } from "../data/prompt-templates";

interface PromptCardsProps {
	interests: string[];
	onSelect: (text: string) => void;
}

export function PromptCards({ interests, onSelect }: PromptCardsProps) {
	const prompts = useMemo(() => generatePrompts(interests, 4), [interests]);

	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
			<div className="flex flex-col items-center gap-1 text-center">
				<MessageCircle className="h-8 w-8 text-muted-foreground/50" />
				<p className="text-sm font-medium text-foreground">Break the ice!</p>
				<p className="text-xs text-muted-foreground">
					Tap a conversation starter or type your own message
				</p>
			</div>
			<div className="grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
				{prompts.map((prompt) => (
					<button
						key={prompt}
						type="button"
						onClick={() => onSelect(prompt)}
						className="rounded-xl border border-border/50 bg-muted/50 px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted hover:border-border"
					>
						{prompt}
					</button>
				))}
			</div>
		</div>
	);
}
