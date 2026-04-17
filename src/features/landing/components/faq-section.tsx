import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { SectionEyebrow } from "./section-eyebrow";

const faqs = [
	{
		question: "Is Lume really free?",
		answer:
			"Yes. Text chat, matching, and every game are free and stay that way. No ads in the chat, no paywalled features on the core experience.",
	},
	{
		question: "Do I need an account?",
		answer:
			"Yes — email and password, takes about 30 seconds. Accounts let us age-gate the platform, moderate effectively, and keep your match preferences between sessions.",
	},
	{
		question: "How is Lume different from Omegle or Rumi?",
		answer:
			"Text-first (no forced video), interest-based matching instead of purely random, real-time AI moderation, and built-in multiplayer games that live beside the chat. Safer, quicker to match, more to do.",
	},
	{
		question: "What games are there?",
		answer:
			"Five playable today: tic-tac-toe, trivia, connect four, would-you-rather, and rock-paper-scissors. A round takes 2–5 minutes and runs right alongside your conversation. More on the way.",
	},
	{
		question: "Is it safe?",
		answer:
			"AI moderation runs on every message before it's delivered. Block and report are one tap. You're anonymous by default — no photo, no real name, no phone number — and the platform is 18+ only.",
	},
	{
		question: "Do my chats get stored?",
		answer:
			"Messages are delivered over an ephemeral real-time channel and aren't saved to a database by default. When a chat ends, the transcript goes with it.",
	},
	{
		question: "Does it work on my phone?",
		answer:
			"Yes. Lume is a progressive web app — open it in any mobile browser, add to home screen if you like, and you're set. No App Store, no Play Store.",
	},
	{
		question: "Can I pick who I talk to?",
		answer:
			"You pick the vibe, not the person. Add interests (music, gaming, movies, etc.) and we pair you with someone who picked the same. Skip to the next match any time.",
	},
];

export function FaqSection() {
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	return (
		// biome-ignore lint/correctness/useUniqueElementIds: anchor ID for in-page navigation
		<section id="faq">
			<div className="mb-14">
				<div className="mb-5">
					<SectionEyebrow label="FAQ" dotClass="bg-foreground" />
				</div>
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
