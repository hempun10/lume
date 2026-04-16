import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { useMemo, useState } from "react";
import { generatePrompts } from "../data/prompt-templates";

interface PromptSuggestionsProps {
	interests: string[];
	onSelect: (text: string) => void;
}

export function PromptSuggestions({
	interests,
	onSelect,
}: PromptSuggestionsProps) {
	const [isExpanded, setIsExpanded] = useState(true);
	const prompts = useMemo(() => generatePrompts(interests, 4), [interests]);

	return (
		<div className="shrink-0 border-t border-border/50">
			<button
				type="button"
				onClick={() => setIsExpanded((prev) => !prev)}
				className="flex w-full items-center gap-1.5 px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
			>
				<Lightbulb className="h-3 w-3" />
				<span>Suggestions</span>
				{isExpanded ? (
					<ChevronDown className="ml-auto h-3 w-3" />
				) : (
					<ChevronUp className="ml-auto h-3 w-3" />
				)}
			</button>
			{isExpanded && (
				<div className="flex gap-2 overflow-x-auto px-4 pb-2">
					{prompts.map((prompt) => (
						<button
							key={prompt}
							type="button"
							onClick={() => onSelect(prompt)}
							className="shrink-0 rounded-lg border border-border/50 bg-muted/50 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted hover:border-border"
						>
							{prompt}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
