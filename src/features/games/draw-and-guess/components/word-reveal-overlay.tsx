import { cn } from "@/lib/utils";

export function WordRevealOverlay({
	word,
	show,
}: {
	word: string;
	show: boolean;
}) {
	return (
		<div
			className={cn(
				"pointer-events-none absolute inset-0 z-10 flex items-center justify-center",
				"transition-opacity duration-300 ease-out motion-reduce:transition-none",
				show ? "opacity-100" : "opacity-0",
			)}
			aria-hidden={!show}
		>
			<div className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-background/95 px-6 py-4 shadow-lg backdrop-blur">
				<span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
					Your word
				</span>
				<span className="text-balance text-center text-2xl font-semibold text-foreground">
					{word}
				</span>
			</div>
		</div>
	);
}
