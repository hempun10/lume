import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { MockLobbyPreview } from "./mocks/product-mocks";

export function HeroSection() {
	return (
		<section className="w-full pt-10 md:pt-20">
			<div className="grid gap-12 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-10">
				<div>
					<h1 className="max-w-2xl text-balance font-semibold text-3xl leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-5xl">
						Meet a stranger. Chat. Play a quick game. Move on.
					</h1>

					<p className="mt-5 max-w-[560px] text-pretty text-base font-medium leading-relaxed text-muted-foreground sm:mt-6">
						Lume is a text-first way to meet new people. Match on a shared
						interest, play a round of tic-tac-toe while you talk, skip to the
						next one whenever you want. No profiles, no followers, no video.
					</p>

					<div className="mt-8 flex flex-wrap items-center gap-3">
						<Link
							to="/login"
							className="group inline-flex items-center gap-2 rounded-2xl border border-primary bg-primary px-5 py-2.5 text-base font-medium text-primary-foreground shadow-xs transition-shadow hover:bg-primary/90"
						>
							Start Chatting
							<ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
						</Link>
						<Link
							to="/login"
							className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-5 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-muted"
						>
							Create account
						</Link>
					</div>

					<p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
						<span>Free forever</span>
						<span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
						<span>30-second setup</span>
						<span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
						<span>5 built-in games</span>
					</p>
				</div>

				<div className="md:pl-2">
					<MockLobbyPreview />
				</div>
			</div>
		</section>
	);
}
