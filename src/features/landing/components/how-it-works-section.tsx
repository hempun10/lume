import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { MockMatchFoundPreview } from "./mocks/product-mocks";
import { SectionEyebrow } from "./section-eyebrow";

const steps = [
	{
		number: 1,
		chipClass:
			"bg-brand-50 text-brand-600 ring-1 ring-brand-500/15 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-400/20",
		title: "Sign up",
		description:
			"Email, password, done. 30 seconds, no credit card, no phone number.",
	},
	{
		number: 2,
		chipClass:
			"bg-purple-50 text-purple-600 ring-1 ring-purple-500/15 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-400/20",
		title: "Pick a vibe",
		description:
			"Tap a few interests &mdash; music, gaming, movies, whatever you'd actually want to talk about.",
	},
	{
		number: 3,
		chipClass:
			"bg-green-50 text-green-600 ring-1 ring-green-500/15 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-400/20",
		title: "Chat and play",
		description:
			"We match you with someone online. Say hi. Start a game. Skip anytime.",
	},
];

export function HowItWorksSection() {
	return (
		// biome-ignore lint/correctness/useUniqueElementIds: anchor ID for in-page navigation
		<section id="how-it-works">
			<div className="mb-14">
				<div className="mb-5">
					<SectionEyebrow label="How it works" dotClass="bg-foreground" />
				</div>
				<h2 className="max-w-xl font-semibold text-xl leading-[1.2] tracking-tight text-foreground sm:text-2xl md:text-3xl">
					From signup to first hi in
					<br />
					under a minute
				</h2>
				<p className="mt-4 max-w-2xl text-pretty text-sm font-medium leading-relaxed text-muted-foreground">
					Most of our users are in a conversation before the tab beside this one
					finishes loading.
				</p>
			</div>

			<div className="grid gap-10 md:grid-cols-[1fr_1.05fr] md:items-start">
				<div className="grid gap-8">
					{steps.map((step) => (
						<div
							key={step.number}
							className="flex gap-4 border-l border-border pl-5"
						>
							<div>
								<div
									className={`mb-3 inline-flex size-7 items-center justify-center rounded-lg ${step.chipClass}`}
								>
									<span className="font-mono text-[11px] font-semibold tabular-nums">
										0{step.number}
									</span>
								</div>
								<h3 className="mb-1.5 text-base font-semibold text-foreground">
									{step.title}
								</h3>
								<p
									className="text-sm text-muted-foreground"
									// biome-ignore lint/security/noDangerouslySetInnerHtml: static, authored copy with &mdash;
									dangerouslySetInnerHTML={{ __html: step.description }}
								/>
							</div>
						</div>
					))}
				</div>

				<div className="md:pl-2">
					<MockMatchFoundPreview />
				</div>
			</div>

			<div className="mt-10">
				<Link
					to="/login"
					className="group inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-all duration-200 hover:bg-secondary/80"
				>
					<span>Try it now</span>
					<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
				</Link>
			</div>
		</section>
	);
}
