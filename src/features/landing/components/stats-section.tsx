const stats = [
	{
		value: "< 3s",
		title: "to match",
		description:
			"Tap the button. A real person is on the other side before you blink.",
	},
	{
		value: "5",
		title: "built-in games",
		description:
			"Tic-tac-toe, trivia, would-you-rather, rock-paper-scissors, two truths & a lie.",
	},
	{
		value: "0",
		title: "profiles to curate",
		description:
			"No photos, no bio, no followers. You're just a person saying hi.",
	},
	{
		value: "24/7",
		title: "moderated",
		description: "AI filtering plus one-tap block and report on every chat.",
	},
];

export function StatsSection() {
	return (
		<section>
			<div className="mb-14">
				<h2 className="max-w-xl font-semibold text-xl leading-[1.2] tracking-tight text-foreground sm:text-2xl md:text-3xl">
					Random chat, without the
					<br />
					parts everyone hates
				</h2>
				<p className="mt-4 max-w-2xl text-pretty text-sm font-medium leading-relaxed text-muted-foreground">
					The old internet&rsquo;s best idea &mdash; meet a stranger, talk for a
					minute, move on &mdash; minus the video, the bots, and the dread.
				</p>
			</div>
			<div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10">
				{stats.map((stat) => (
					<div key={stat.title}>
						<p className="font-semibold text-3xl text-foreground tracking-tight tabular-nums md:text-4xl">
							{stat.value}
						</p>
						<h4 className="mt-2 text-sm font-semibold text-foreground">
							{stat.title}
						</h4>
						<p className="mt-1 text-pretty text-xs text-muted-foreground">
							{stat.description}
						</p>
					</div>
				))}
			</div>
		</section>
	);
}
