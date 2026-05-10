import { cn } from "@/lib/utils";

/**
 * UserJot-style product preview slab.
 *
 * A soft warm-gray rounded panel that clips a floating browser window. The
 * window is intentionally wider/taller than the slab so it bleeds past the
 * right and bottom edges — the slab's `overflow-hidden` then clips it,
 * giving the "screenshot peeking out of the frame" effect.
 *
 * The screenshot inside renders at its natural aspect ratio (`w-full
 * h-auto`); the slab's height controls how much of the screenshot is
 * visible. No object-cover / scaling hacks.
 */
export function BrowserMockup({
	children,
	className,
	url,
	aspect = "aspect-[5/3]",
}: {
	children: React.ReactNode;
	className?: string;
	/** Centered pill in the chrome (e.g. "lume-roan.vercel.app"). Optional. */
	url?: string;
	/** Aspect ratio of the framed slab itself. */
	aspect?: string;
}) {
	return (
		<div className={cn("relative w-full", className)}>
			<div
				className={cn(
					"relative overflow-hidden rounded-2xl",
					"bg-[#f6f5ef] dark:bg-[#1a1a1a]",
					"ring-1 ring-black/[0.06] dark:ring-white/[0.06]",
					aspect,
				)}
			>
				{/* Soft top highlight — gives the slab a subtle "lit from above" feel. */}
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/40 to-transparent dark:from-white/[0.03]"
				/>

				{/*
				 * Browser window. Positioned to bleed past the right and bottom
				 * edges of the slab so the slab clips it, matching the UserJot
				 * "peeking screenshot" treatment.
				 */}
				<div className="absolute inset-x-[5%] top-[8%] bottom-[-8%] sm:inset-x-[6%] sm:top-[10%] sm:bottom-[-10%]">
					<div
						className={cn(
							"flex h-full w-full flex-col overflow-hidden rounded-t-xl",
							"bg-white dark:bg-neutral-900",
							"ring-1 ring-black/[0.08] dark:ring-white/[0.08]",
							"shadow-[0_24px_60px_-20px_rgba(15,15,15,0.18)] dark:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]",
						)}
					>
						{/* Chrome — traffic lights left, centered URL pill. */}
						<div className="relative flex h-9 shrink-0 items-center border-b border-black/[0.06] px-3 dark:border-white/[0.06]">
							<div className="flex items-center gap-1.5">
								<span className="size-2.5 rounded-full bg-[#ff5f57]" />
								<span className="size-2.5 rounded-full bg-[#febc2e]" />
								<span className="size-2.5 rounded-full bg-[#28c840]" />
							</div>
							{url ? (
								<div className="absolute left-1/2 -translate-x-1/2">
									<span className="rounded-md bg-black/[0.04] px-3 py-0.5 font-mono text-[11px] text-muted-foreground dark:bg-white/[0.06]">
										{url}
									</span>
								</div>
							) : null}
						</div>

						{/* Screenshot area — image renders at natural aspect ratio. */}
						<div className="relative flex-1 overflow-hidden bg-white dark:bg-neutral-900">
							{children}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
