import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
	{
		question: "Is Lume really free?",
		answer:
			"Yes. Core features — text chat, matching, and games — are completely free and always will be. We may offer optional cosmetic upgrades in the future, but the core experience stays free.",
	},
	{
		question: "Do I need to create an account?",
		answer:
			"No. You can start chatting as a guest immediately. Creating an account is optional and only needed if you want to save friends, track game stats, or get a verified badge.",
	},
	{
		question: "How is Lume different from Omegle?",
		answer:
			"Lume is text-first (no forced video), has built-in multiplayer games, uses AI moderation to keep things safe, and offers smart interest-based matching instead of purely random pairing.",
	},
	{
		question: "Is it safe?",
		answer:
			"Safety is our top priority. We use AI-powered content moderation, one-tap blocking and reporting, and anonymous-by-default identities. We actively filter bots and inappropriate content in real-time.",
	},
	{
		question: "What kind of games are available?",
		answer:
			"We have trivia, word games, drawing challenges, quick strategy games, and more. All games are designed to be played in 2-5 minutes alongside a conversation, making them perfect icebreakers.",
	},
	{
		question: "Can I use Lume on my phone?",
		answer:
			"Absolutely. Lume is built as a progressive web app (PWA) that works beautifully on any device — phone, tablet, or desktop. No app store download needed.",
	},
	{
		question: "What happens to my chat history?",
		answer:
			"Nothing — because we don't store it. Chats are ephemeral by default. Once a conversation ends, it's gone. Your privacy is non-negotiable.",
	},
	{
		question: "Can I choose who I talk to?",
		answer:
			"You can add interest tags to improve your matches. We pair you with people who share similar interests and language preferences. You can always skip to the next person instantly.",
	},
];

export function FaqSection() {
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	return (
		<section>
			<div className="mb-14">
				<h2 className="max-w-xl text-xl font-semibold leading-[1.2] tracking-tight text-foreground sm:text-2xl md:text-3xl">
					Frequently asked questions
				</h2>
				<p className="mt-4 max-w-2xl text-pretty text-sm font-medium leading-relaxed text-muted-foreground">
					Everything you need to know about Lume and how it works.
				</p>
			</div>

			<div className="flex flex-col divide-y divide-border">
				{faqs.map((faq, index) => (
					<div key={faq.question} className="py-6 first:pt-0 last:pb-0">
						<button
							type="button"
							onClick={() => setOpenIndex(openIndex === index ? null : index)}
							className="group flex w-full items-start justify-between gap-4 text-left"
						>
							<h3 className="text-base font-semibold text-foreground transition-colors group-hover:text-foreground/80">
								{faq.question}
							</h3>
							<ChevronDown
								className={`mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:text-foreground ${
									openIndex === index ? "rotate-180" : "rotate-0"
								}`}
							/>
						</button>
						<div
							className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
								openIndex === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
							}`}
						>
							<div className="overflow-hidden">
								<p className="mt-3 pr-8 text-sm leading-relaxed text-muted-foreground">
									{faq.answer}
								</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
