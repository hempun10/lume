import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaSection() {
	return (
		<section>
			<div className="mb-8 inline-flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-500/15 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-400/20">
				<Sparkles className="size-6" />
			</div>

			<div className="mb-10">
				<h2 className="max-w-xl font-semibold text-xl leading-[1.2] tracking-tight text-foreground sm:text-2xl md:text-3xl">
					Close the tab,
					<br />
					or say hi to a stranger.
				</h2>
				<p className="mt-4 max-w-2xl text-pretty text-sm font-medium leading-relaxed text-muted-foreground">
					You&rsquo;re five seconds away from a conversation you didn&rsquo;t
					plan on having. Most of the good ones start that way.
				</p>
			</div>

			<div className="flex flex-col items-start gap-4">
				<Link
					to="/login"
					className="group inline-flex items-center gap-2 rounded-2xl border border-primary bg-primary px-5 py-2.5 text-base font-medium text-primary-foreground shadow-xs transition-shadow hover:bg-primary/90"
				>
					<span>Start Chatting</span>
					<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
				</Link>
				<p className="text-sm text-muted-foreground">
					Free forever &middot; 30-second setup &middot; Works on any device
				</p>
			</div>
		</section>
	);
}
