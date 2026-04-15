import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

const steps = [
	{
		number: 1,
		color: "bg-brand-500",
		title: "Jump in",
		description:
			"Hit the button — no signup, no profile, no friction. You're ready to go in seconds.",
	},
	{
		number: 2,
		color: "bg-purple-500",
		title: "Get matched",
		description:
			"Our algorithm pairs you with someone interesting. Add interests to improve your matches.",
	},
	{
		number: 3,
		color: "bg-green-500",
		title: "Chat & play",
		description:
			"Start talking, challenge them to a game, or both. When you're done, skip to the next person.",
	},
];

export function HowItWorksSection() {
	return (
		<section>
			<div className="mb-14">
				<h2 className="max-w-xl text-xl font-semibold leading-[1.2] tracking-tight text-foreground sm:text-2xl md:text-3xl">
					Start talking in
					<br />
					under 10 seconds
				</h2>
				<p className="mt-4 max-w-2xl text-pretty text-sm font-medium leading-relaxed text-muted-foreground">
					No app to download, no account to create, no phone number to verify.
					Just click and connect.
				</p>
			</div>

			<div className="grid gap-8 divide-border md:grid-cols-3 md:gap-0 md:divide-x">
				{steps.map((step, i) => (
					<div
						key={step.number}
						className={
							i === 0
								? "md:pr-8"
								: i === steps.length - 1
									? "md:pl-8"
									: "md:px-8"
						}
					>
						<div
							className={`mb-4 flex h-6 w-6 items-center justify-center rounded-full ${step.color}`}
						>
							<span className="text-xs font-semibold text-white">
								{step.number}
							</span>
						</div>
						<h3 className="mb-3 text-lg font-semibold text-foreground">
							{step.title}
						</h3>
						<p className="text-sm text-muted-foreground">{step.description}</p>
					</div>
				))}
			</div>

			<p className="mt-10 text-pretty text-sm font-medium text-muted-foreground">
				Seriously, that's it. Our average user is chatting within 8 seconds of
				landing on Lume.
			</p>

			<div className="mt-10">
				<Link
					to="/login"
					className="group inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 bg-secondary text-secondary-foreground hover:bg-secondary/80"
				>
					<span>Try it now</span>
					<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
				</Link>
			</div>
		</section>
	);
}
