import { Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/features/theme";
import { cn } from "@/lib/utils";

interface AuthLayoutClasses {
	leftFormClassName?: string;
}

interface AuthLayoutProps {
	children: ReactNode;
	/** Quote text shown in the right branding panel. */
	quote?: string;
	/** Caption below the quote in the right branding panel. */
	caption?: string;
	/** Additional classes for the left form card. */
	classNames?: AuthLayoutClasses;
}

const DEFAULT_QUOTE =
	"Meet real people, play real games. Lume makes spontaneous connections feel natural and fun.";
const DEFAULT_CAPTION = "Instant text chat & multiplayer games with strangers";

/**
 * Full-screen split-screen auth layout inspired by UserJot.
 * Includes its own minimal nav bar (back-to-home + theme toggle).
 * Left: form card. Right: branding panel with dot-grid background.
 * On mobile only the form shows.
 */
export function AuthLayout({
	children,
	quote = DEFAULT_QUOTE,
	caption = DEFAULT_CAPTION,
	classNames,
}: AuthLayoutProps) {
	return (
		<div className="flex h-screen flex-col">
			{/* Minimal nav bar */}
			<nav className="flex items-center justify-between px-6 py-3">
				<Link
					to="/"
					className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
				>
					<ArrowLeft className="h-4 w-4" />
					Home
				</Link>
				<ThemeToggle />
			</nav>

			{/* Split-screen content */}
			<div className="flex min-h-0 flex-1">
				{/* Left — form side */}
				<div className="flex w-full items-center justify-center bg-muted p-6 lg:w-1/2 lg:p-10">
					<div
						className={cn(
							"w-full max-w-[400px]",
							classNames?.leftFormClassName,
						)}
					>
						{children}
					</div>
				</div>

				{/* Right — branding panel (desktop only) */}
				<div className="relative hidden items-center justify-center overflow-hidden bg-background lg:flex lg:w-1/2">
					{/* Dot grid background */}
					<div
						className="absolute inset-0"
						style={{
							backgroundImage:
								"radial-gradient(circle, var(--color-foreground) 0.75px, transparent 0.75px)",
							backgroundSize: "24px 24px",
							opacity: 0.07,
						}}
					/>

					{/* Branding content */}
					<div className="relative z-10 flex max-w-sm flex-col items-center gap-6 px-8 text-center">
						<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground">
							<Sparkles className="h-8 w-8 text-background" />
						</div>
						<blockquote className="space-y-3">
							<p className="text-lg font-medium leading-relaxed text-foreground">
								&ldquo;{quote}&rdquo;
							</p>
							<footer className="text-sm text-muted-foreground">
								{caption}
							</footer>
						</blockquote>
					</div>
				</div>
			</div>
		</div>
	);
}
