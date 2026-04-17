import { cn } from "@/lib/utils";

interface LumeLogoProps extends React.SVGProps<SVGSVGElement> {
	/** Additional classes. Defaults to `h-8 w-8`. */
	className?: string;
}

/**
 * Lume brand mark: a dark rounded-square tile containing a friendly white
 * chat bubble with a smiley face. Warm, playful, approachable — matches the
 * product voice (text-first chat with strangers, safe and fun).
 *
 * Drawn on a 32×32 viewBox. Uses theme tokens so the tile and bubble both
 * invert correctly in dark mode:
 *  - tile fill: `currentColor` (set via `text-foreground` on the parent)
 *  - bubble fill: `--color-background` (the inverse)
 *  - eyes / smile: `currentColor` again so they read on the bubble
 *
 * Usage:
 *   <LumeLogo className="h-8 w-8 text-foreground" />
 */
export function LumeLogo({ className, ...rest }: LumeLogoProps) {
	return (
		<svg
			viewBox="0 0 32 32"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={cn("h-8 w-8", className)}
			aria-hidden="true"
			{...rest}
		>
			{/* Rounded-square tile */}
			<rect x="0" y="0" width="32" height="32" rx="8" fill="currentColor" />

			{/* Speech bubble (inverse of tile color) with a small tail bottom-left */}
			<path
				d="M16 7.5a8 8 0 0 1 6.47 12.71l.66 3.04a.55.55 0 0 1-.75.62l-3.07-1.3A8 8 0 1 1 16 7.5Z"
				fill="var(--color-background)"
			/>

			{/* Left eye */}
			<circle cx="13" cy="14.5" r="1.15" fill="currentColor" />
			{/* Right eye */}
			<circle cx="18.4" cy="14.5" r="1.15" fill="currentColor" />
			{/* Smile */}
			<path
				d="M12.6 17.2c.9 1.35 2.1 2.05 3.4 2.05s2.5-.7 3.4-2.05"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				fill="none"
			/>
		</svg>
	);
}
