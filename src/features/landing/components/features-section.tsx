import {
	Ban,
	Dice5,
	Eye,
	Gamepad2,
	Globe,
	type LucideIcon,
	MessageCircle,
	Shield,
	Sparkles,
	Swords,
	Trophy,
	UserCheck,
	Users,
} from "lucide-react";
import { BrowserMockup } from "./browser-mockup";
import { SectionBadge } from "./section-badge";
import { ThemedImage } from "./themed-image";

// UserJot-style icon palette. Only the icon itself is colored — no background
// chip, no ring. Each Chat/Games feature rotates through this palette.
// Safety intentionally stays single-color (green) so it reads as one unified
// "trust" block.
const ICON_ROSE = "text-rose-500 dark:text-rose-400";
const ICON_PURPLE = "text-purple-500 dark:text-purple-400";
const ICON_BLUE = "text-blue-500 dark:text-blue-400";
const ICON_GREEN = "text-green-500 dark:text-green-400";
const ICON_ORANGE = "text-orange-500 dark:text-orange-400";
const ICON_VIOLET = "text-violet-500 dark:text-violet-400";
const ICON_EMERALD = "text-emerald-500 dark:text-emerald-400";
const ICON_PINK = "text-pink-500 dark:text-pink-400";

interface Feature {
	icon: LucideIcon;
	iconColor: string;
	title: string;
	description: string;
}

const chatFeatures: Feature[] = [
	{
		icon: MessageCircle,
		iconColor: ICON_ROSE,
		title: "Text-first",
		description: "No webcam pressure. Just type.",
	},
	{
		icon: Users,
		iconColor: ICON_ORANGE,
		title: "Interest matching",
		description: "Paired on what you actually like talking about.",
	},
	{
		icon: Globe,
		iconColor: ICON_BLUE,
		title: "Global pool",
		description: "Real people from 190+ countries, online right now.",
	},
	{
		icon: Sparkles,
		iconColor: ICON_PINK,
		title: "Conversation starters",
		description: "Stuck for words? Tap a prompt, send it, keep going.",
	},
];

const gameFeatures: Feature[] = [
	{
		icon: Gamepad2,
		iconColor: ICON_PURPLE,
		title: "Play inside the chat",
		description: "The board opens beside the conversation. No context switch.",
	},
	{
		icon: Dice5,
		iconColor: ICON_EMERALD,
		title: "2–5 minute rounds",
		description: "Quick enough to play, not long enough to get awkward.",
	},
	{
		icon: Trophy,
		iconColor: ICON_ORANGE,
		title: "Best-of / rematch",
		description: "Tap rematch and keep playing until someone has to go.",
	},
	{
		icon: Swords,
		iconColor: ICON_VIOLET,
		title: "Synced in real time",
		description: "Moves, reveals, and scores stay in lock-step across devices.",
	},
];

const safetyFeatures: Feature[] = [
	{
		icon: Shield,
		iconColor: ICON_GREEN,
		title: "AI moderation",
		description: "Harmful content is filtered before it lands.",
	},
	{
		icon: Ban,
		iconColor: ICON_GREEN,
		title: "One-tap block",
		description: "Skip, block, and report live in one gesture.",
	},
	{
		icon: Eye,
		iconColor: ICON_GREEN,
		title: "Anonymous by default",
		description: "No photos, no names. Share what you want to share.",
	},
	{
		icon: UserCheck,
		iconColor: ICON_GREEN,
		title: "18+ only",
		description: "Age-gated at signup. Kept that way.",
	},
];

function FeatureIconGrid({ features }: { features: Feature[] }) {
	return (
		<div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10">
			{features.map((feature) => (
				<div key={feature.title}>
					<feature.icon
						className={`mb-3 size-7 ${feature.iconColor}`}
						strokeWidth={2}
					/>
					<h4 className="text-sm font-semibold text-foreground">
						{feature.title}
					</h4>
					<p className="mt-1 text-pretty text-xs text-muted-foreground">
						{feature.description}
					</p>
				</div>
			))}
		</div>
	);
}

interface FeatureBlockProps {
	label: string;
	chipClass: string;
	heading: string;
	description: string;
	features: Feature[];
	callout?: string;
	/** When true, renders the big dashboard image below the icon grid. */
	withPreview?: boolean;
	previewLabel?: string;
	previewLightSrc?: string;
	previewDarkSrc?: string;
}

function FeatureBlock({
	label,
	chipClass,
	heading,
	description,
	features,
	callout,
	withPreview = false,
	previewLabel,
	previewLightSrc,
	previewDarkSrc,
}: FeatureBlockProps) {
	return (
		<section>
			<div className="mb-5">
				<SectionBadge label={label} chipClass={chipClass} />
			</div>

			<div className="mb-10">
				<h2 className="max-w-xl font-semibold text-xl leading-[1.2] tracking-tight text-foreground sm:text-2xl md:text-3xl">
					{heading}
				</h2>
				<p className="mt-4 max-w-2xl text-pretty text-sm font-medium leading-relaxed text-muted-foreground">
					{description}
				</p>
			</div>

			<FeatureIconGrid features={features} />

			{withPreview && (
				<div className="mt-12">
					<BrowserMockup url="lume-roan.vercel.app">
						<ThemedImage
							alt={`${label} dashboard preview`}
							placeholderLabel={
								previewLabel ?? `${label.toLowerCase()} preview`
							}
							lightSrc={previewLightSrc}
							darkSrc={previewDarkSrc}
						/>
					</BrowserMockup>
				</div>
			)}

			{callout && (
				<div className="mt-8 flex max-w-2xl gap-4">
					<div className="w-1 shrink-0 rounded-full bg-primary" />
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
		// biome-ignore lint/correctness/useUniqueElementIds: anchor target for in-page navigation
		<div id="features">
			<FeatureBlock
				label="Text Chat"
				chipClass="bg-primary"
				heading="Real conversations, with a stranger, right now"
				description="You hit match, we pair you with a real person who's also looking to talk. Interests show up when they help, and skipping to the next match is always one tap away."
				features={chatFeatures}
				withPreview
				previewLabel="chat preview"
				previewLightSrc="/landing/chat-light.png"
				previewDarkSrc="/landing/chat-dark.png"
				callout="No swipes. No likes. Just the oldest good idea on the internet: two strangers, a blank window, say something."
			/>

			<hr className="my-20 border-t border-border" />

			<FeatureBlock
				label="Games"
				chipClass="bg-purple-500"
				heading="Break the ice with a game, not a prompt"
				description="Every chat can turn into a quick round of tic-tac-toe, trivia, would-you-rather, or rock-paper-scissors. The game lives beside the conversation — play, talk, rematch."
				features={gameFeatures}
				withPreview
				previewLabel="games preview"
				previewLightSrc="/landing/playing-game-light.png"
				previewDarkSrc="/landing/playing-game-dark.png"
				callout="You'll be surprised how fast ‘good game’ turns into a real conversation."
			/>

			<hr className="my-20 border-t border-border" />

			<FeatureBlock
				label="Safety"
				chipClass="bg-green-500"
				heading="Safe isn’t a feature. It’s the default."
				description="Every older stranger-chat app treats moderation as an afterthought. We don't. AI filtering runs on every message, blocking is instant, and you're anonymous unless you choose not to be."
				features={safetyFeatures}
			/>
		</div>
	);
}
