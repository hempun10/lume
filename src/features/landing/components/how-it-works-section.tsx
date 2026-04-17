const steps = [
	{
		number: 1,
		chipClass: "bg-blue-500 text-white",
		title: "Sign up",
		description:
			"Email, password, done. 30 seconds, no credit card, no phone number.",
	},
	{
		number: 2,
		chipClass: "bg-purple-500 text-white",
		title: "Pick a vibe",
		description:
			"Tap a few interests — music, gaming, movies, whatever you'd actually want to talk about.",
	},
	{
		number: 3,
		chipClass: "bg-green-500 text-white",
		title: "Chat and play",
		description:
			"We match you with someone online. Say hi. Start a game. Skip anytime.",
	},
];

export function HowItWorksSection() {
	return (
		// biome-ignore lint/correctness/useUniqueElementIds: anchor target for in-page navigation
		<section id="how-it-works">
			<div className="mb-14">
				<h2 className="max-w-xl font-semibold text-xl leading-[1.2] tracking-tight text-foreground sm:text-2xl md:text-3xl">
					From signup to first hi
					<br />
					in under a minute
				</h2>
			</div>

			<div className="grid gap-10 md:grid-cols-3 md:gap-0">
				{steps.map((step, index) => (
					<div
						key={step.number}
						className={
							index === 0
								? "md:pr-10"
								: "md:border-l md:border-border md:pl-10 md:pr-10 last:md:pr-0"
						}
					>
						<div
							className={`mb-8 inline-flex size-8 items-center justify-center rounded-full font-semibold text-sm tabular-nums ${step.chipClass}`}
						>
							{step.number}
						</div>
						<h3 className="mb-3 text-lg font-semibold tracking-tight text-foreground">
							{step.title}
						</h3>
						<p className="text-pretty text-sm leading-relaxed text-muted-foreground">
							{step.description}
						</p>
					</div>
				))}
			</div>

			<div className="mt-14 flex max-w-2xl gap-4">
				<div className="w-1 shrink-0 rounded-full bg-brand-500" />
				<p className="text-pretty text-sm font-medium text-muted-foreground">
					Seriously, it's that simple. Most users are in a conversation before
					the tab beside this one finishes loading.
				</p>
			</div>
		</section>
	);
}
