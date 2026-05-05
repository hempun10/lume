import { useState } from "react";
import { useTheme } from "@/features/theme";
import { cn } from "@/lib/utils";

/**
 * Theme-aware screenshot. Swaps `lightSrc` / `darkSrc` based on theme and
 * renders the image at its natural aspect ratio (`w-full h-auto`) so it
 * never gets cropped or letterboxed by an outer aspect-ratio container.
 *
 * Designed for use inside `<BrowserMockup>`: the mockup's content area is
 * `overflow-hidden`, so any height beyond the visible viewport is clipped
 * naturally — exactly the UserJot "screenshot peeks out the bottom" effect.
 *
 * If no src is provided (or the image fails to load) a labeled placeholder
 * is shown instead so the layout never collapses.
 */
export function ThemedImage({
	lightSrc,
	darkSrc,
	alt,
	className,
	placeholderLabel,
	placeholderAspect = "aspect-[16/10]",
}: {
	lightSrc?: string;
	darkSrc?: string;
	alt: string;
	className?: string;
	/** Optional label shown inside the placeholder. */
	placeholderLabel?: string;
	/** Aspect ratio used only by the placeholder when no src is available. */
	placeholderAspect?: string;
}) {
	const { theme } = useTheme();
	const [failedSrc, setFailedSrc] = useState<string | null>(null);
	const candidate = theme === "dark" ? darkSrc : lightSrc;
	const src = candidate && candidate !== failedSrc ? candidate : undefined;

	if (!src) {
		return (
			<div
				className={cn(
					"relative w-full overflow-hidden bg-muted/30",
					placeholderAspect,
					className,
				)}
			>
				<div
					aria-hidden
					className="absolute inset-0 opacity-[0.6] dark:opacity-[0.4]"
					style={{
						backgroundImage:
							"linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
						backgroundSize: "32px 32px",
					}}
				/>
				<div className="absolute inset-0 flex items-center justify-center">
					<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
						{placeholderLabel ?? "dashboard preview"}
					</p>
				</div>
			</div>
		);
	}

	return (
		<img
			src={src}
			alt={alt}
			loading="eager"
			decoding="async"
			onError={() => setFailedSrc(candidate ?? null)}
			className={cn("block h-auto w-full max-w-none", className)}
		/>
	);
}
