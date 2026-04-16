/** Maps interest keywords to conversation starter prompts. */
const INTEREST_PROMPTS: Record<string, string[]> = {
	hiking: [
		"What's the best trail you've ever hiked?",
		"Do you prefer mountain trails or coastal walks?",
	],
	anime: [
		"What anime are you watching right now?",
		"What's your all-time favorite anime?",
	],
	gaming: [
		"What game are you playing right now?",
		"What's a game you could replay forever?",
	],
	music: [
		"What song has been stuck in your head lately?",
		"Do you play any instruments?",
	],
	movies: [
		"Seen any good movies lately?",
		"What's a movie you think everyone should watch?",
	],
	cooking: [
		"What's your signature dish?",
		"What's the most adventurous thing you've cooked?",
	],
	reading: [
		"What book are you reading right now?",
		"What's a book that changed your perspective?",
	],
	travel: [
		"What's the best place you've ever traveled to?",
		"Where's next on your travel bucket list?",
	],
	photography: [
		"What do you love photographing the most?",
		"Phone camera or dedicated camera?",
	],
	fitness: [
		"What's your go-to workout?",
		"Do you prefer gym or outdoor exercise?",
	],
	coding: [
		"What are you building right now?",
		"What programming language do you enjoy most?",
	],
	art: [
		"What kind of art do you create?",
		"Who's an artist that inspires you?",
	],
	sports: [
		"What sport do you follow the most?",
		"Do you play any sports yourself?",
	],
	fashion: [
		"How would you describe your style?",
		"What's a fashion trend you love right now?",
	],
	pets: [
		"Do you have any pets? Tell me about them!",
		"Are you more of a cat or dog person?",
	],
};

const GENERIC_PROMPTS = [
	"What's something interesting that happened to you recently?",
	"If you could learn any skill instantly, what would it be?",
	"What's something you're really passionate about?",
	"What's the best advice you've ever received?",
	"If you could travel anywhere tomorrow, where would you go?",
	"What's a hobby you've always wanted to pick up?",
	"What's the last thing that made you laugh out loud?",
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
