import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

interface AuthLayoutProps {
	children: ReactNode;
}

/**
 * Split-screen auth layout inspired by UserJot.
 * Left: form card. Right: branding panel with dot-grid background.
 * On mobile only the form shows.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="flex min-h-[calc(100vh-64px)]">
			{/* Left — form side */}
			<div className="flex w-full items-center justify-center bg-muted p-6 lg:w-1/2 lg:p-10">
				<div className="w-full max-w-[400px]">
					{/* Logo icon */}
					<div className="mb-6 flex h-9 w-9 items-center justify-center rounded-lg bg-foreground">
						<Sparkles className="h-5 w-5 text-background" />
					</div>
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
							"Meet real people, play real games. Lume makes spontaneous
							connections feel natural and fun."
						</p>
						<footer className="text-sm text-muted-foreground">
							Instant text chat & multiplayer games with strangers
						</footer>
					</blockquote>
				</div>
			</div>
		</div>
	);
}
