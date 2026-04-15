import { Gamepad2, MessageCircle, Shield, Zap } from "lucide-react";

const stats = [
	{
		icon: MessageCircle,
		iconColor: "text-brand-600",
		title: "10K+ chats daily",
		description: "Real conversations happening every minute across the globe",
	},
	{
		icon: Gamepad2,
		iconColor: "text-purple-600",
		title: "5+ multiplayer games",
		description: "Break the ice with fun games while you get to know someone",
	},
	{
		icon: Shield,
		iconColor: "text-green-600",
		title: "Moderated & safe",
		description:
			"AI-powered moderation keeps the community welcoming for everyone",
	},
	{
		icon: Zap,
		iconColor: "text-amber-600",
		title: "Instant matching",
		description: "Get connected with someone new in under 3 seconds",
	},
];

export function StatsSection() {
	return (
		<section>
			<div className="mb-14">
				<h2 className="max-w-xl text-xl font-semibold leading-[1.2] tracking-tight text-foreground sm:text-2xl md:text-3xl">
					A better way to meet
					<br />
					people online
				</h2>
				<p className="mt-4 max-w-2xl text-pretty text-sm font-medium leading-relaxed text-muted-foreground">
					<span className="font-medium text-foreground">
						Random doesn't mean reckless.
					</span>{" "}
					Lume is built from the ground up with safety, fun, and real connection
					at its core. No awkward video calls — just text, games, and good
					vibes.
				</p>
			</div>
			<div className="mt-8">
				<div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10">
					{stats.map((stat) => (
						<div key={stat.title}>
							<stat.icon className={`mb-3 h-10 w-10 ${stat.iconColor}`} />
							<h4 className="text-sm font-semibold text-foreground">
								{stat.title}
							</h4>
							<p className="mt-1 text-pretty text-xs text-muted-foreground">
								{stat.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
