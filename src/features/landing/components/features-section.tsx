import {
	Ban,
	Dice5,
	Eye,
	Gamepad2,
	Globe,
	MessageCircle,
	Shield,
	Sparkles,
	Swords,
	Trophy,
	UserCheck,
	Users,
} from "lucide-react";

const chatFeatures = [
	{
		icon: MessageCircle,
		iconColor: "text-brand-600",
		title: "Text-first chat",
		description: "No pressure of video — express yourself through words",
	},
	{
		icon: Users,
		iconColor: "text-brand-600",
		title: "Smart matching",
		description: "Paired by interests and language for better conversations",
	},
	{
		icon: Globe,
		iconColor: "text-brand-600",
		title: "Global reach",
		description: "Connect with people from 190+ countries instantly",
	},
	{
		icon: Sparkles,
		iconColor: "text-brand-600",
		title: "Conversation starters",
		description:
			"AI-suggested icebreakers so you never run out of things to say",
	},
];

const gameFeatures = [
	{
		icon: Gamepad2,
		iconColor: "text-purple-600",
		title: "Play while you chat",
		description: "Games run alongside your conversation — multitask naturally",
	},
	{
		icon: Dice5,
		iconColor: "text-purple-600",
		title: "Casual & quick",
		description:
			"Pick-up games that take 2-5 minutes, perfect for breaking the ice",
	},
	{
		icon: Trophy,
		iconColor: "text-purple-600",
		title: "Leaderboards",
		description: "Compete globally and show off your skills to new friends",
	},
	{
		icon: Swords,
		iconColor: "text-purple-600",
		title: "Challenge anyone",
		description: "Invite your chat partner to a quick round anytime",
	},
];

const safetyFeatures = [
	{
		icon: Shield,
		iconColor: "text-green-600",
		title: "AI moderation",
		description: "Real-time content filtering keeps conversations respectful",
	},
	{
		icon: Ban,
		iconColor: "text-green-600",
		title: "One-tap block & report",
		description: "Instantly remove anyone who ruins the vibe",
	},
	{
		icon: Eye,
		iconColor: "text-green-600",
		title: "Anonymous by default",
		description: "No personal info shared unless you choose to",
	},
	{
		icon: UserCheck,
		iconColor: "text-green-600",
		title: "Optional verification",
		description: "Verified badge for users who want to build trust",
	},
];

interface FeatureBlockProps {
	label: string;
	labelColor: string;
	heading: string;
	description: string;
	features: {
		icon: React.ComponentType<{ className?: string }>;
		iconColor: string;
		title: string;
		description: string;
	}[];
	callout?: string;
}

function FeatureBlock({
	label,
	labelColor,
	heading,
	description,
	features,
	callout,
}: FeatureBlockProps) {
	return (
		<section>
			<div className="pb-5">
				<div className="flex items-center gap-2.5">
					<div className={`h-2 w-4 rounded-full ${labelColor}`} />
					<p className="text-sm font-medium text-foreground">{label}</p>
				</div>
			</div>

			<div className="mb-14">
				<h2 className="max-w-xl text-xl font-semibold leading-[1.2] tracking-tight text-foreground sm:text-2xl md:text-3xl">
					{heading}
				</h2>
				<p className="mt-4 max-w-2xl text-pretty text-sm font-medium leading-relaxed text-muted-foreground">
					{description}
				</p>
			</div>

			<div className="mt-8">
				<div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10">
					{features.map((feature) => (
						<div key={feature.title}>
							<feature.icon className={`mb-3 h-10 w-10 ${feature.iconColor}`} />
							<h4 className="text-sm font-semibold text-foreground">
								{feature.title}
							</h4>
							<p className="mt-1 text-pretty text-xs text-muted-foreground">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>

			{callout && (
				<div className="mt-10 flex max-w-2xl gap-4">
					<div className="w-1 shrink-0 rounded-full bg-brand-500" />
					<p className="text-pretty text-sm font-medium text-muted-foreground">
						{callout}
					</p>
				</div>
			)}
		</section>
	);
}

export function FeaturesSection() {
	return (
		<>
			<FeatureBlock
				label="Text Chat"
				labelColor="bg-brand-500"
				heading="Spontaneous conversations that actually matter"
				description="Skip the swipe fatigue and algorithm games. On Lume, you're matched with a real person who's ready to talk right now. No profiles to curate, no followers to chase."
				features={chatFeatures}
				callout="Every conversation is a blank slate. Who you are matters more than how you look."
			/>

			<hr className="my-20 border-t border-border" />

			<FeatureBlock
				label="Games"
				labelColor="bg-purple-500"
				heading="Break the ice with multiplayer games"
				description="Sometimes the best conversations start with a little friendly competition. Play quick multiplayer games while you chat — from trivia to word games to strategy."
				features={gameFeatures}
				callout="Games make every match fun, even if you're not sure what to say first."
			/>

			<hr className="my-20 border-t border-border" />

			<FeatureBlock
				label="Safety"
				labelColor="bg-green-500"
				heading="Your safety is not an afterthought"
				description="We built Lume because the alternatives treat safety as a checkbox. Our AI moderation, instant blocking, and anonymous-first design mean you can be yourself without worrying."
				features={safetyFeatures}
			/>
		</>
	);
}
