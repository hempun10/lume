import { Check, Copy, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { generatePrompts } from "@/features/chat/data/prompt-templates";

interface PromptPreviewCardProps {
	interests: string[];
}

export function PromptPreviewCard({ interests }: PromptPreviewCardProps) {
	const [seed, setSeed] = useState(0);
	const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: seed is the shuffle trigger
	const prompts = useMemo(
		() => generatePrompts(interests, 3),
		[interests, seed],
	);

	async function handleCopy(prompt: string) {
		try {
			await navigator.clipboard.writeText(prompt);
			setCopiedPrompt(prompt);
			setTimeout(() => setCopiedPrompt(null), 1500);
		} catch {
			// Ignore — clipboard unavailable
		}
	}

	return (
		<section className="space-y-3 duration-500 animate-in fade-in slide-in-from-bottom-2 [animation-delay:120ms]">
			<div className="flex items-end justify-between">
				<div className="space-y-1">
					<p className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
						Starters
					</p>
					<h2 className="font-semibold text-foreground text-lg tracking-tight">
						Break the ice
					</h2>
				</div>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setSeed((s) => s + 1)}
					className="h-8 gap-1.5 text-xs transition-transform duration-150 ease-out active:scale-[0.97]"
					aria-label="Shuffle prompts"
				>
					<RefreshCw className="size-3.5" aria-hidden />
					Shuffle
				</Button>
			</div>

			<div className="grid gap-2 sm:grid-cols-3">
				{prompts.map((prompt) => {
					const copied = copiedPrompt === prompt;
					return (
						<div
							key={prompt}
							className="group flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-colors duration-150 ease-out hover:border-foreground/30"
						>
							<p className="text-foreground text-sm leading-relaxed text-pretty">
								{prompt}
							</p>
							<button
								type="button"
								onClick={() => handleCopy(prompt)}
								aria-label={copied ? "Copied" : `Copy prompt: ${prompt}`}
								className="flex items-center gap-1 self-end font-medium text-muted-foreground text-xs transition-[color,transform] duration-150 ease-out hover:text-foreground active:scale-[0.97]"
							>
								{copied ? (
									<>
										<Check className="size-3" aria-hidden />
										Copied
									</>
								) : (
									<>
										<Copy className="size-3" aria-hidden />
										Copy
									</>
								)}
							</button>
						</div>
					);
				})}
			</div>
		</section>
	);
}
