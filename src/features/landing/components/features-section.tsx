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
import { MockChatPreview, MockTicTacToePreview } from "./mocks/product-mocks";
import { SectionEyebrow } from "./section-eyebrow";

const CHIP_BRAND =
	"bg-brand-50 text-brand-600 ring-1 ring-brand-500/10 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-400/20";
const CHIP_PURPLE =
	"bg-purple-50 text-purple-600 ring-1 ring-purple-500/10 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-400/20";
const CHIP_GREEN =
	"bg-green-50 text-green-600 ring-1 ring-green-500/10 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-400/20";

const chatFeatures = [
	{
		icon: MessageCircle,
		chipClass: CHIP_BRAND,
		title: "Text-first",
		description: "No webcam pressure. Just type.",
	},
	{
		icon: Users,
		chipClass: CHIP_BRAND,
		title: "Interest matching",
		description: "Paired on what you actually like talking about.",
	},
	{
		icon: Globe,
		chipClass: CHIP_BRAND,
		title: "Global pool",
		description: "Real people from 190+ countries, online right now.",
	},
	{
		icon: Sparkles,
		chipClass: CHIP_BRAND,
		title: "Conversation starters",
		description: "Stuck for words? Tap a prompt, send it, keep going.",
	},
];

const gameFeatures = [
	{
		icon: Gamepad2,
		chipClass: CHIP_PURPLE,
		title: "Play inside the chat",
		description: "The board opens beside the conversation. No context switch.",
	},
	{
		icon: Dice5,
		chipClass: CHIP_PURPLE,
		title: "2–5 minute rounds",
		description: "Quick enough to play, not long enough to get awkward.",
	},
	{
		icon: Trophy,
		chipClass: CHIP_PURPLE,
		title: "Best-of / rematch",
		description: "Tap rematch and keep playing until someone has to go.",
	},
	{
		icon: Swords,
		chipClass: CHIP_PURPLE,
		title: "Synced in real time",
		description: "Moves, reveals, and scores stay in lock-step across devices.",
	},
];

const safetyFeatures = [
	{
		icon: Shield,
		chipClass: CHIP_GREEN,
		title: "AI moderation",
		description: "Harmful content is filtered before it lands.",
	},
	{
		icon: Ban,
		chipClass: CHIP_GREEN,
		title: "One-tap block",
		description: "Skip, block, and report live in one gesture.",
	},
	{
		icon: Eye,
		chipClass: CHIP_GREEN,
		title: "Anonymous by default",
		description: "No photos, no names. Share what you want to share.",
	},
	{
		icon: UserCheck,
		chipClass: CHIP_GREEN,
		title: "18+ only",
		description: "Age-gated at signup. Kept that way.",
	},
];

interface FeatureBlockProps {
	label: string;
	labelColor: string;
	heading: string;
	description: string;
	features: {
		icon: React.ComponentType<{ className?: string }>;
		chipClass: string;
		title: string;
		description: string;
	}[];
	callout?: string;
	preview?: React.ReactNode;
	previewPosition?: "left" | "right";
}

function FeatureBlock({
	label,
	labelColor,
	heading,
	description,
	features,
	callout,
	preview,
	previewPosition = "right",
}: FeatureBlockProps) {
	const header = (
		<>
			<div className="pb-5">
				<SectionEyebrow label={label} dotClass={labelColor} />
			</div>
			<div className="mb-10">
				<h2 className="max-w-xl font-semibold text-xl leading-[1.2] tracking-tight text-foreground sm:text-2xl md:text-3xl">
					{heading}
				</h2>
				<p className="mt-4 max-w-2xl text-pretty text-sm font-medium leading-relaxed text-muted-foreground">
					{description}
				</p>
			</div>
		</>
	);

	const featureGrid = (
		<div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10">
			{features.map((feature) => (
				<div key={feature.title}>
					<div
						className={`mb-3 inline-flex size-9 items-center justify-center rounded-xl ${feature.chipClass}`}
					>
						<feature.icon className="size-[18px]" />
					</div>
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

	return (
		<section>
			{header}

			{preview ? (
				<div
					className={
						previewPosition === "left"
							? "mb-10 grid gap-10 md:grid-cols-[1fr_1.05fr] md:items-center"
							: "mb-10 grid gap-10 md:grid-cols-[1.05fr_1fr] md:items-center"
					}
				>
					{previewPosition === "left" ? (
						<>
							<div>{preview}</div>
							<div className="md:pl-2">{featureGrid}</div>
						</>
					) : (
						<>
							<div>{featureGrid}</div>
							<div className="md:pl-2">{preview}</div>
						</>
					)}
				</div>
			) : (
				<div className="mt-8">{featureGrid}</div>
			)}

			{callout && (
				<div className="mt-4 flex max-w-2xl gap-4">
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
		// biome-ignore lint/correctness/useUniqueElementIds: anchor ID for in-page navigation
		<div id="features">
			<FeatureBlock
				label="Text Chat"
				labelColor="bg-brand-500"
				heading="Real conversations, with a stranger, right now"
				description="You hit match, we pair you with a real person who's also looking to talk. Interests show up when they help, and skipping to the next match is always one tap away."
				features={chatFeatures}
				preview={<MockChatPreview />}
				previewPosition="right"
				callout="No swipes. No likes. Just the oldest good idea on the internet: two strangers, a blank window, say something."
			/>

			<hr className="my-20 border-t border-border" />

			<FeatureBlock
				label="Games"
				labelColor="bg-purple-500"
				heading="Break the ice with a game, not a prompt"
				description="Every chat can turn into a quick round of tic-tac-toe, connect four, trivia, would-you-rather, or rock-paper-scissors. The game lives beside the conversation &mdash; play, talk, rematch."
				features={gameFeatures}
				preview={<MockTicTacToePreview />}
				previewPosition="left"
				callout="You'll be surprised how fast &lsquo;good game&rsquo; turns into a real conversation."
			/>

			<hr className="my-20 border-t border-border" />

			<FeatureBlock
				label="Safety"
				labelColor="bg-green-500"
				heading="Safe isn&rsquo;t a feature. It&rsquo;s the default."
				description="Every older stranger-chat app treats moderation as an afterthought. We don't. AI filtering runs on every message, blocking is instant, and you're anonymous unless you choose not to be."
				features={safetyFeatures}
			/>
		</div>
	);
}
