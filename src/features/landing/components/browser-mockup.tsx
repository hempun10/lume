import { cn } from "@/lib/utils";

/**
 * UserJot-style product preview: a soft gradient "slab" with a blurred
 * frosted-glass overlay, an inner hairline, and a translucent Safari-like
 * window chrome floating inside — the screenshot bleeds past the bottom so
 * it peeks out of the frame.
 *
 * The outer slab aspect ratio controls the framed area; the mockup inside
 * is positioned absolutely and extends below (`-bottom-20`) to create the
 * "peeking screenshot" effect used on UserJot.com.
 */
export function BrowserMockup({
	children,
	className,
	aspect = "aspect-[5/3]",
}: {
	children: React.ReactNode;
	className?: string;
	/** Aspect ratio of the framed slab (not the screenshot itself). */
	aspect?: string;
}) {
	return (
		<div className={cn("relative w-full", className)}>
			<div
				className={cn(
					"relative flex justify-center overflow-hidden rounded-xl shadow-xs transition-all duration-500",
					aspect,
				)}
				style={{
					// Layered radial + linear gradients form a soft cloudy slab.
					// Uses neutral grays so it reads the same in light and dark mode;
					// the frosted ring below keeps it sitting cleanly on any bg.
					background:
						"radial-gradient(circle at 20% 80%, rgba(115,115,115,0.3), transparent 50%), radial-gradient(circle at 80% 20%, rgba(229,229,229,0.3), transparent 50%), radial-gradient(circle at 40% 40%, rgba(163,163,163,0.2), transparent 60%), linear-gradient(135deg, #f5f5f5, #e5e5e5)",
				}}
			>
				{/* Frosted-glass layer — softens the gradient behind the mockup. */}
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 z-10 size-full rounded-xl"
					style={{
						backdropFilter: "blur(100px)",
						WebkitBackdropFilter: "blur(100px)",
					}}
				/>

				{/* Hairline inner ring — adds definition to the slab edge. */}
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 z-30 size-full rounded-xl ring-1 ring-inset ring-black/10 dark:ring-white/10"
				/>

				{/* Browser chrome wrapper — bleeds below the slab bottom. */}
				<div className="absolute inset-x-0 -bottom-20 top-0 z-20 flex w-full justify-center p-6 sm:p-8 md:p-10">
					<div className="h-full w-full overflow-hidden rounded-xl bg-white/50 px-1.5 pb-1.5 shadow-xl ring-1 ring-gray-500/10 backdrop-blur-xl dark:bg-white/5 dark:ring-white/10">
						{/* Traffic-light dots. Default gray, hint of color on hover. */}
						<div className="flex items-center justify-between py-2">
							<div className="flex items-center gap-1 px-1">
								<span className="h-2 w-2 rounded-full border border-gray-950/10 bg-gray-100/30 transition-colors duration-300 hover:bg-red-500 dark:border-white/10 dark:bg-white/10" />
								<span className="h-2 w-2 rounded-full border border-gray-950/10 bg-gray-100/30 transition-colors duration-300 hover:bg-yellow-500 dark:border-white/10 dark:bg-white/10" />
								<span className="h-2 w-2 rounded-full border border-gray-950/10 bg-gray-100/30 transition-colors duration-300 hover:bg-green-500 dark:border-white/10 dark:bg-white/10" />
							</div>
						</div>
						{children}
					</div>
				</div>
			</div>
		</div>
	);
}
