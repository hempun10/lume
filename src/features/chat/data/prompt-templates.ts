/** Maps interest keywords (lowercased) to playful conversation starters. */
const INTEREST_PROMPTS: Record<string, string[]> = {
	gaming: [
		"What game have you lost sleep to recently?",
		"Controller, keyboard, or phone — which one are you loyal to?",
		"What's a game you'd force everyone to try?",
	],
	music: [
		"What song would play if you walked into a room in slow motion?",
		"Guilty-pleasure song — no judgment, I promise.",
		"Concert you'd time-travel to see?",
	],
	movies: [
		"Pick a movie you can recite word-for-word.",
		"Theater snack strategy — spill it.",
		"Worst movie you secretly love?",
	],
	sports: [
		"Sport you pretend to understand at parties?",
		"Who's your 'I'd-fight-someone-for-them' team?",
		"Ever played a sport that almost killed you?",
	],
	travel: [
		"Place that ruined all other places for you?",
		"Weirdest food you ate abroad and actually liked?",
		"Window seat or aisle — and defend it.",
	],
	reading: [
		"Book that lived rent-free in your head for weeks?",
		"Physical book, e-reader, or audiobook — pick your fighter.",
		"Last book you stayed up way too late for?",
	],
	cooking: [
		"What's your '3 AM, nothing in the fridge' meal?",
		"Most ambitious dish that went horribly wrong?",
		"Food hill you'd die on?",
	],
	art: [
		"What do you make when no one's watching?",
		"Art that made you feel something weird?",
		"If you had to get one piece of art tattooed — what?",
	],
	photography: [
		"Favorite photo you've ever taken — describe it.",
		"Golden hour or blue hour?",
		"What do you photograph way too much of?",
	],
	fitness: [
		"Workout you love to hate?",
		"Morning person or 'gym at 10pm' person?",
		"Weirdest thing you've done to avoid cardio?",
	],
	technology: [
		"Piece of tech you'd be lost without?",
		"Hot take on AI — go.",
		"Best gadget you've ever bought under $50?",
	],
	fashion: [
		"Describe your style in three words.",
		"Item you wear until it literally falls apart?",
		"Trend you'll never touch?",
	],
	anime: [
		"First anime that wrecked you emotionally?",
		"Sub or dub — and be honest.",
		"Which anime world would you survive in?",
	],
	science: [
		"Science fact that permanently broke your brain?",
		"Space, deep sea, or the human body — pick your rabbit hole.",
		"If you could run any experiment, no ethics board, what?",
	],
	history: [
		"What historical era would you nope right back out of?",
		"Underrated historical figure more people should know?",
		"If you could witness one event, which?",
	],
	nature: [
		"Mountains, ocean, or forest — quick, pick one.",
		"Coolest animal you've seen in the wild?",
		"Weather you'd live in forever?",
	],
	pets: [
		"Tell me about your pet — name, personality, crimes committed.",
		"Cat person, dog person, or chaotic third option?",
		"Weirdest thing your pet has ever done?",
	],
	comedy: [
		"Last thing that made you laugh-cry?",
		"Comedian whose specials you've rewatched too many times?",
		"Joke format you'll never get tired of?",
	],
};

const GENERIC_PROMPTS = [
	"Pineapple on pizza — defend your stance.",
	"Weirdest thing you've Googled this week?",
	"If your life had a theme song right now, what would it be?",
	"What's the last thing that genuinely surprised you?",
	"You get one superpower, but it's slightly cursed — what is it?",
	"What's a useless skill you're strangely proud of?",
	"Best thing you've eaten in the last 7 days?",
	"If we had to plan a heist together, what's your role?",
	"What's something you believed as a kid that was totally wrong?",
	"Describe your week in one emoji.",
];

/**
 * Pick a random element from an array.
 */
function pickRandom<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate conversation starter prompts based on stranger's interests.
 * Returns up to `count` prompts, prioritizing interest-based ones.
 */
export function generatePrompts(interests: string[], count = 4): string[] {
	const prompts: string[] = [];
	const usedGeneric = new Set<number>();

	// Match interests to prompt templates
	for (const interest of interests) {
		if (prompts.length >= count) break;
		const key = interest.toLowerCase().trim();
		const templates = INTEREST_PROMPTS[key];
		if (templates) {
			prompts.push(pickRandom(templates));
		}
	}

	// Fill remaining slots with generic prompts
	while (prompts.length < count) {
		const idx = Math.floor(Math.random() * GENERIC_PROMPTS.length);
		if (usedGeneric.has(idx)) continue;
		usedGeneric.add(idx);
		prompts.push(GENERIC_PROMPTS[idx]);
		// Safety: if we've used all generics, stop
		if (usedGeneric.size >= GENERIC_PROMPTS.length) break;
	}

	return prompts;
}
