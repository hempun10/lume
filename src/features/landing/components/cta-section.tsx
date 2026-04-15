import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaSection() {
	return (
		<section>
			<div className="relative mb-10 inline-flex justify-center">
				<Sparkles className="h-12 w-12 text-brand-500" />
			</div>

			<div className="mb-10">
				<h2 className="max-w-xl text-xl font-semibold leading-[1.2] tracking-tight text-foreground sm:text-2xl md:text-3xl">
					Stop scrolling.
					<br />
					Start connecting.
				</h2>
				<p className="mt-4 max-w-2xl text-pretty text-sm font-medium leading-relaxed text-muted-foreground">
					Every minute you spend swiping is a minute you could spend having a
					real conversation with a real person. Lume makes it instant, safe, and
					actually fun.
				</p>
			</div>

			<div className="flex flex-col items-start gap-6">
				<div className="mt-4">
					<Link
						to="/login"
						className="group inline-flex items-center gap-2 rounded-2xl border border-primary bg-primary px-5 py-2.5 text-base font-medium text-primary-foreground shadow-xs transition-shadow hover:bg-primary/90"
					>
						<span>Start Chatting Now</span>
						<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
					</Link>
				</div>
				<p className="text-sm text-muted-foreground">
					Free forever &middot; No signup required &middot; Works on any device
				</p>
			</div>
		</section>
	);
}
