import { Link } from "@tanstack/react-router";
import { ArrowRight, Gamepad2, MessageCircle, Shield } from "lucide-react";

export function HeroSection() {
	return (
		<section className="w-full pt-10 md:pt-20">
			<div className="mx-auto max-w-4xl">
				<h1 className="max-w-2xl text-balance text-xl font-semibold tracking-tight leading-[1.2] text-foreground sm:text-3xl md:text-4xl">
					Meet new people through{" "}
					<span className="mx-0.5 inline-flex items-center gap-1 rounded p-1 ring-1 bg-brand-500/10 text-brand-600 ring-brand-400/20">
						<MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
					</span>{" "}
					conversations and{" "}
					<span className="mx-0.5 inline-flex items-center gap-1 rounded p-1 ring-1 bg-purple-500/10 text-purple-600 ring-purple-400/20">
						<Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5" />
					</span>{" "}
					games — safely and instantly
				</h1>

				<p className="mt-4 max-w-[630px] text-pretty text-base font-medium leading-relaxed text-muted-foreground sm:mt-6">
					Lume connects you with real people around the world for spontaneous
					text chats and fun multiplayer games. No profiles, no followers — just
					genuine human connection in the moment.
				</p>

				<div className="mt-12 flex flex-col items-start">
					<Link
						to="/login"
						className="relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap border bg-clip-padding font-medium transition-shadow min-h-10 px-5 py-2.5 text-base border-primary bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 rounded-2xl"
					>
						Start Chatting Now
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>

				<p className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
					<span className="inline-flex items-center gap-1.5">
						<Shield className="h-4 w-4 text-muted-foreground" />
						Free forever
					</span>
					<span className="inline-flex items-center gap-1.5">
						<MessageCircle className="h-4 w-4 text-muted-foreground" />
						No signup required to chat
					</span>
					<span className="hidden sm:inline-flex items-center gap-1.5">
						<Gamepad2 className="h-4 w-4 text-muted-foreground" />
						5+ built-in games
					</span>
				</p>
			</div>
		</section>
	);
}
