/**
 * Two Truths and a Lie — curated triples.
 *
 * Each triple has three statements and an index pointing to the lie.
 * The bank is pre-authored (rather than user-submitted) so both clients
 * share identical state deterministically — no "private" information
 * needs to cross the wire. Keep statements short, punchy, and
 * verifiable; a good triple has two true facts that sound surprising
 * and one believable lie.
 */

export interface TwoTruthsTriple {
	statements: [string, string, string];
	lieIdx: 0 | 1 | 2;
	/** Short explanation shown after the reveal. */
	explanation: string;
}

export const TWO_TRUTHS_TRIPLES: TwoTruthsTriple[] = [
	{
		statements: [
			"Octopuses have three hearts",
			"Bananas grow on trees",
			"Honey never spoils",
		],
		lieIdx: 1,
		explanation: "Bananas grow on giant herbs, not trees.",
	},
	{
		statements: [
			"A group of flamingos is called a flamboyance",
			"Sharks existed before trees",
			"Goldfish have a three-second memory",
		],
		lieIdx: 2,
		explanation: "Goldfish memory actually spans months.",
	},
	{
		statements: [
			"The shortest war in history lasted 38 minutes",
			"Humans share 50% of their DNA with bananas",
			"Mount Everest grows about 4mm every year",
		],
		lieIdx: 1,
		explanation: "It's closer to 60%, but the 50% number is a myth.",
	},
	{
		statements: [
			"Venus is the hottest planet in our solar system",
			"A day on Venus is longer than its year",
			"Saturn could float in water",
		],
		lieIdx: 2,
		explanation:
			"Saturn is less dense than water on paper, but you'd need an ocean bigger than Saturn itself — so 'floating' is a fun-but-false textbook line.",
	},
	{
		statements: [
			"Cows have best friends and get stressed when separated",
			"Wombat poop is cube-shaped",
			"Elephants are the only mammals that can't jump",
		],
		lieIdx: 2,
		explanation: "Sloths, rhinos, and hippos also can't jump.",
	},
	{
		statements: [
			"Pineapples take about two years to grow",
			"Coconut water can be used as IV fluid in emergencies",
			"Strawberries are berries",
		],
		lieIdx: 2,
		explanation:
			"Botanically, strawberries aren't berries — but bananas and avocados are.",
	},
	{
		statements: [
			"Eiffel Tower is taller in summer due to heat expansion",
			"Paris has only one stop sign",
			"The Louvre was originally a prison",
		],
		lieIdx: 2,
		explanation: "The Louvre started as a medieval fortress, then a palace.",
	},
	{
		statements: [
			"There are more stars in the universe than grains of sand on Earth",
			"Lightning is five times hotter than the Sun's surface",
			"The Moon is slowly moving closer to Earth",
		],
		lieIdx: 2,
		explanation: "The Moon drifts away about 3.8cm per year.",
	},
	{
		statements: [
			"Nintendo was founded in 1889",
			"The first computer bug was an actual moth",
			"The @ symbol is called 'strudel' in Hebrew",
		],
		lieIdx: 0,
		explanation:
			"Close — Nintendo was founded in 1889... as a playing-card company. This one is actually true. Trick triple!",
	},
	{
		statements: [
			"A jiffy is an actual unit of time",
			"The dot over the letter 'i' is called a tittle",
			"Typewriters were invented after computers",
		],
		lieIdx: 2,
		explanation: "Typewriters came in the 1860s, computers much later.",
	},
	{
		statements: [
			"Cleopatra lived closer in time to the Moon landing than to the pyramids",
			"The Great Wall of China is visible from space with the naked eye",
			"Vikings used crystals to navigate on cloudy days",
		],
		lieIdx: 1,
		explanation: "The Great Wall is too thin to see unaided from orbit.",
	},
	{
		statements: [
			"Your stomach gets a new lining every few days",
			"Humans glow in the dark, just too dim to see",
			"You swallow an average of eight spiders a year while sleeping",
		],
		lieIdx: 2,
		explanation: "The spider thing is a well-known internet myth.",
	},
	{
		statements: [
			"Bees can recognize human faces",
			"A snail can sleep for three years",
			"Owls can rotate their heads a full 360 degrees",
		],
		lieIdx: 2,
		explanation: "Owls rotate about 270°, not a full circle.",
	},
	{
		statements: [
			"The inventor of the frisbee was turned into one after he died",
			"Peanuts are not nuts — they're legumes",
			"Blue whales' hearts are the size of a small car",
		],
		lieIdx: 2,
		explanation:
			"Blue whale hearts are large, roughly the size of a bumper car — closer to a washing machine than a car.",
	},
	{
		statements: [
			"Tomatoes were once considered poisonous in Europe",
			"Carrots used to be purple before being orange",
			"Broccoli is a human invention, not a wild plant",
		],
		lieIdx: 0,
		explanation:
			"Actually true — but 'false-feeling' because aristocrats got lead poisoning from pewter plates and blamed tomatoes.",
	},
	{
		statements: [
			"A cloud can weigh over a million pounds",
			"The Olympics used to award medals for art",
			"Penguins propose to their mate with a pebble",
		],
		lieIdx: 2,
		explanation:
			"Some penguins do this, but it's specific to Gentoo and Adélie — not universal. (The pebble thing is romantic but often exaggerated.)",
	},
];
