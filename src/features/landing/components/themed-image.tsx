import { useTheme } from "@/features/theme";
import { cn } from "@/lib/utils";

/**
 * Renders a theme-aware image. Expects two variants (light + dark) and swaps
 * based on the current theme. While real assets are being produced the
 * component falls back to a labeled placeholder that respects the container
 * aspect ratio so the layout stays stable.
 *
 * Designed to sit inside `<BrowserMockup>`, so the image uses `rounded-lg`
 * + a soft hairline ring that matches the chrome's inner edge. Pass
 * `bare` to skip the ring/rounding when rendering outside a mockup.
 */
export function ThemedImage({
	lightSrc,
	darkSrc,
	alt,
	className,
	aspect = "aspect-[16/10]",
	placeholderLabel,
	bare = false,
}: {
	lightSrc?: string;
	darkSrc?: string;
	alt: string;
	className?: string;
	/** Tailwind aspect-* class controlling the placeholder / image ratio. */
	aspect?: string;
	/** Optional label shown inside the placeholder. */
	placeholderLabel?: string;
	/** When true, skip the default border/ring so the parent frame handles it. */
	bare?: boolean;
}) {
	const { theme } = useTheme();
	const src = theme === "dark" ? darkSrc : lightSrc;

	if (!src) {
		return (
			<div
				className={cn(
					"relative w-full overflow-hidden rounded-lg",
					!bare && "border border-border bg-muted/40",
					aspect,
					className,
				)}
			>
				{/* subtle grid so the placeholder doesn't look broken */}
				<div
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
			className={cn(
				"h-auto w-full max-w-full object-cover",
				bare
					? "rounded-lg ring-1 ring-gray-500/10 shadow-xs"
					: "rounded-2xl border border-border",
				aspect,
				className,
			)}
		/>
	);
}
