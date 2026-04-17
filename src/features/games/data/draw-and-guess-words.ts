/**
 * Word bank for Draw & Guess, split across three difficulty tiers.
 *
 * - Easy: concrete, visually distinct objects. Distractors drawn at
 *   random from the same tier — likely to be unrelated, so the MCQ
 *   panel is forgiving.
 * - Medium: themed groups (instruments, sports, weather, kitchen,
 *   etc.). Distractors pulled from the *same* theme so the MCQ
 *   panel has plausible siblings — a rushed sketch won't disambiguate.
 * - Hard: abstract nouns, verbs, compounds. Distractors from the
 *   same tier — often conceptually close, so even a clear sketch
 *   needs the right idea. Great for confident drawers.
 *
 * Keep words drawable on a phone-sized canvas in ~60s.
 */

export type DrawAndGuessDifficulty = "easy" | "medium" | "hard";

/* ---------------------------------- easy ---------------------------------- */

const EASY_WORDS: readonly string[] = [
	"apple",
	"banana",
	"pizza",
	"donut",
	"cat",
	"dog",
	"fish",
	"bird",
	"snake",
	"butterfly",
	"car",
	"bicycle",
	"airplane",
	"boat",
	"rocket",
	"train",
	"house",
	"tree",
	"mountain",
	"castle",
	"bridge",
	"sun",
	"moon",
	"star",
	"cloud",
	"rainbow",
	"snowflake",
	"guitar",
	"camera",
	"phone",
	"clock",
	"umbrella",
	"crown",
	"pencil",
	"book",
	"key",
	"scissors",
	"hammer",
	"robot",
	"ghost",
	"dragon",
	"heart",
	"eye",
	"hat",
	"leaf",
	"shoe",
	"chair",
	"ladder",
];

/* --------------------------------- medium --------------------------------- */

// Themed groups. The picker draws the target and its decoys from the
// SAME theme so MCQ options are plausibly close.
const MEDIUM_THEMES: readonly (readonly string[])[] = [
	// Musical instruments
	["violin", "piano", "drum", "flute", "trumpet", "harp", "saxophone"],
	// Sports
	["tennis", "baseball", "golf", "hockey", "soccer", "bowling", "archery"],
	// Weather phenomena
	["tornado", "blizzard", "lightning", "hailstorm", "drizzle", "hurricane"],
	// Kitchen appliances
	["blender", "toaster", "kettle", "microwave", "fridge", "oven"],
	// Footwear
	["sneaker", "boot", "sandal", "high heel", "slipper", "flip flop"],
	// Bugs / small critters
	[
		"ant",
		"bee",
		"spider",
		"ladybug",
		"dragonfly",
		"grasshopper",
		"caterpillar",
	],
	// Vehicles (beyond the everyday)
	["submarine", "tractor", "ambulance", "fire truck", "scooter", "monorail"],
	// Water creatures
	["octopus", "jellyfish", "seahorse", "starfish", "crab", "shrimp", "eel"],
	// Furniture
	["couch", "bookshelf", "desk", "dresser", "nightstand", "rocking chair"],
	// Tools
	["wrench", "screwdriver", "saw", "drill", "chisel", "pliers"],
];

const MEDIUM_WORDS: readonly string[] = MEDIUM_THEMES.flat();

/* ---------------------------------- hard ---------------------------------- */

// Abstract nouns, verbs, compounds. Distractors pulled from same tier
// at random — conceptual overlap is the point.
const HARD_WORDS: readonly string[] = [
	"gravity",
	"whisper",
	"eclipse",
	"nostalgia",
	"rewind",
	"tangled",
	"overflow",
	"bookworm",
	"daydream",
	"balance",
	"courage",
	"jetlag",
	"stampede",
	"silence",
	"echo",
	"mirage",
	"ripple",
	"avalanche",
	"blueprint",
	"countdown",
	"heartbreak",
	"earthquake",
	"freedom",
	"fossil",
	"lullaby",
	"recycle",
	"shadow",
	"sunrise",
	"teamwork",
	"vortex",
	"whirlpool",
	"yawn",
	"sneeze",
	"hiccup",
	"tickle",
];

/* --------------------------------- picker --------------------------------- */

function shuffle<T>(arr: readonly T[]): T[] {
	const out = [...arr];
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const a = out[i];
		const b = out[j];
		if (a !== undefined && b !== undefined) {
			out[i] = b;
			out[j] = a;
		}
	}
	return out;
}

/**
 * Pick 4 MCQ options for a round at the given difficulty. Caller
 * keeps `correctIdx` private until reveal.
 *
 * Medium is themed: the 4 options come from the same group, so the
 * drawer actually has to commit to a recognizable sketch rather
 * than rely on process of elimination.
 */
export function pickRoundOptions(difficulty: DrawAndGuessDifficulty): {
	options: readonly [string, string, string, string];
	correctIdx: 0 | 1 | 2 | 3;
} {
	let pool: readonly string[];
	if (difficulty === "medium") {
		const themes = MEDIUM_THEMES.filter((t) => t.length >= 4);
		const theme = themes[Math.floor(Math.random() * themes.length)] ?? [];
		pool = theme;
	} else if (difficulty === "hard") {
		pool = HARD_WORDS;
	} else {
		pool = EASY_WORDS;
	}

	const shuffled = shuffle(pool);
	const four = shuffled.slice(0, 4) as [string, string, string, string];
	const correctIdx = Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3;
	return { options: four, correctIdx };
}

/** All words, flattened. Useful for tests / validation. */
export const DRAW_AND_GUESS_WORDS: readonly string[] = [
	...EASY_WORDS,
	...MEDIUM_WORDS,
	...HARD_WORDS,
];
