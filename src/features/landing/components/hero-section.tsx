import { Link } from "@tanstack/react-router";
import {
	ArrowRight,
	Gamepad2,
	Gift,
	Infinity as InfinityIcon,
	type LucideIcon,
	MessageCircleMore,
	Sparkles,
	Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrowserMockup } from "./browser-mockup";
import { ThemedImage } from "./themed-image";

/**
 * Inline Lucide-icon chip used inside the hero heading. Fixed-size soft tinted
 * tile (matches UserJot styling): `p-1 rounded ring-1` with `bg-{c}-50`,
 * `text-{c}-600`, and a translucent colored ring.
 */
function HeroChip({
	icon: Icon,
	tintClass,
}: {
	icon: LucideIcon;
	/** Combined bg + text + ring classes, e.g. "bg-indigo-50 text-indigo-600 ring-indigo-200/30". */
	tintClass: string;
}) {
	return (
		<span
			className={cn(
				"inline-flex items-center justify-center rounded p-1 ",
				tintClass,
			)}
			aria-hidden="true"
		>
			<Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.25} />
		</span>
	);
}

/**
 * A chip + phrase paired in an inline-flex container so the chip is a flex
 * sibling of the text (perfectly centered on the cross-axis) rather than an
 * inline element trying to align to the text baseline. The outer h1 wraps
 * these pairs onto multiple lines naturally when space runs out.
 */
function HeroPhrase({
	icon,
	tintClass,
	children,
}: {
	icon: LucideIcon;
	tintClass: string;
	children: React.ReactNode;
}) {
	return (
		<span className="inline-flex items-center gap-2 align-middle">
			<HeroChip icon={icon} tintClass={tintClass} />
			<span>{children}</span>
		</span>
	);
}

export function HeroSection() {
	return (
		<section className="w-full pt-10 md:pt-28">
			<h1 className="flex max-w-xl flex-wrap items-center gap-x-2 gap-y-3 text-balance font-semibold text-xl tracking-tight text-foreground sm:text-3xl">
				<HeroPhrase
					icon={MessageCircleMore}
					tintClass="bg-indigo-50 text-indigo-600 ring-indigo-200/30 dark:bg-indigo-500/15 dark:text-indigo-300 dark:ring-indigo-400/20"
				>
					Meet a stranger,
				</HeroPhrase>
				<HeroPhrase
					icon={Gamepad2}
					tintClass="bg-purple-50 text-purple-600 ring-purple-200/30 dark:bg-purple-500/15 dark:text-purple-300 dark:ring-purple-400/20"
				>
					play a quick game,
				</HeroPhrase>
				<HeroPhrase
					icon={Sparkles}
					tintClass="bg-amber-50 text-amber-600 ring-amber-200/30 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/20"
				>
					keep talking, or move on whenever
				</HeroPhrase>
			</h1>

			<p className="mt-4 max-w-130 text-pretty text-sm font-medium leading-relaxed text-muted-foreground sm:mt-6">
				Lume is the text-first way to meet new people. Match on a shared
				interest, play a round of tic-tac-toe while you talk, skip to the next
				one whenever you want. No profiles, no followers, no video.
			</p>

			<div className="mt-8">
				<Link
					to="/login"
					className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-xs transition-transform hover:bg-primary/90 active:scale-[0.98]"
				>
					Start Chatting Free
					<span className="inline-flex size-5 items-center justify-center rounded-full bg-primary-foreground/15">
						<ArrowRight className="size-3.5" strokeWidth={2.5} />
					</span>
				</Link>
			</div>

			<div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground sm:text-sm">
				<span className="inline-flex items-center gap-1.5">
					<Gift className="size-3.5" strokeWidth={2} />
					Free forever
				</span>
				<span className="inline-flex items-center gap-1.5">
					<Zap className="size-3.5" strokeWidth={2} />
					30-second setup
				</span>
				<span className="inline-flex items-center gap-1.5">
					<InfinityIcon className="size-3.5" strokeWidth={2} />
					Unlimited chats
				</span>
			</div>

			<div className="mt-16 md:mt-20">
				<BrowserMockup url="lume-roan.vercel.app">
					<ThemedImage
						alt="Lume dashboard preview"
						placeholderLabel="hero dashboard"
						lightSrc="/landing/dashboard-light.png"
						darkSrc="/landing/dashboard-dark.png"
					/>
				</BrowserMockup>
			</div>
		</section>
	);
}
