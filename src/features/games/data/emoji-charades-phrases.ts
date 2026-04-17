/**
 * Emoji Charades — curated phrase bank.
 *
 * Each entry is a phrase (movie, song, food, idiom, etc.) with an
 * emoji clue that hints at it, a category for flavor, and three
 * distractor options used to build the 4-choice guesser UI.
 *
 * Keep phrases recognizable across cultures where possible, and keep
 * distractors plausibly close in tone to the correct answer so guessing
 * is actually fun rather than obvious.
 */

export type EmojiCharadesCategory =
	| "movie"
	| "song"
	| "food"
	| "idiom"
	| "place";

export interface EmojiCharadesPhrase {
	phrase: string;
	emojis: string;
	category: EmojiCharadesCategory;
	distractors: [string, string, string];
}

export const EMOJI_CHARADES_PHRASES: EmojiCharadesPhrase[] = [
	{
		phrase: "The Lion King",
		emojis: "🦁👑",
		category: "movie",
		distractors: ["Kung Fu Panda", "Madagascar", "Zootopia"],
	},
	{
		phrase: "Harry Potter",
		emojis: "⚡️🧙‍♂️",
		category: "movie",
		distractors: ["Lord of the Rings", "Percy Jackson", "Doctor Strange"],
	},
	{
		phrase: "Star Wars",
		emojis: "⭐️⚔️",
		category: "movie",
		distractors: ["Star Trek", "Guardians of the Galaxy", "Dune"],
	},
	{
		phrase: "Finding Nemo",
		emojis: "🐠🔍",
		category: "movie",
		distractors: ["The Little Mermaid", "Moana", "Shark Tale"],
	},
	{
		phrase: "Frozen",
		emojis: "❄️👑",
		category: "movie",
		distractors: ["Tangled", "Brave", "Encanto"],
	},
	{
		phrase: "Jurassic Park",
		emojis: "🦖🏞️",
		category: "movie",
		distractors: ["Kong: Skull Island", "The Meg", "Rampage"],
	},
	{
		phrase: "Spider-Man",
		emojis: "🕷️🧑‍🎤",
		category: "movie",
		distractors: ["Batman", "Ant-Man", "Deadpool"],
	},
	{
		phrase: "Despicable Me",
		emojis: "👨‍🦲🍌",
		category: "movie",
		distractors: ["Hop", "Sing", "The Secret Life of Pets"],
	},
	{
		phrase: "Shawshank Redemption",
		emojis: "⛓️🏃",
		category: "movie",
		distractors: ["The Green Mile", "Cool Hand Luke", "Cast Away"],
	},
	{
		phrase: "Raindrops Keep Falling",
		emojis: "🌧️💧🎵",
		category: "song",
		distractors: ["Singin' in the Rain", "Purple Rain", "Umbrella"],
	},
	{
		phrase: "Rolling in the Deep",
		emojis: "🌊🎤🧑‍🎤",
		category: "song",
		distractors: ["Deep End", "Ocean Eyes", "Shallow"],
	},
	{
		phrase: "Blank Space",
		emojis: "⬜️🖊️",
		category: "song",
		distractors: ["Bad Blood", "Shake It Off", "Wildest Dreams"],
	},
	{
		phrase: "Bohemian Rhapsody",
		emojis: "🎭🎹🎸",
		category: "song",
		distractors: ["Killer Queen", "Hey Jude", "Stairway to Heaven"],
	},
	{
		phrase: "Sunflower",
		emojis: "🌻",
		category: "song",
		distractors: ["Daisy", "Dandelion", "Tulip"],
	},
	{
		phrase: "Pizza",
		emojis: "🍕",
		category: "food",
		distractors: ["Pasta", "Lasagna", "Calzone"],
	},
	{
		phrase: "Sushi",
		emojis: "🍣🇯🇵",
		category: "food",
		distractors: ["Ramen", "Tempura", "Onigiri"],
	},
	{
		phrase: "Hot Dog",
		emojis: "🌭🔥",
		category: "food",
		distractors: ["Hamburger", "Corn Dog", "Sausage Roll"],
	},
	{
		phrase: "Ice Cream",
		emojis: "🍦🥶",
		category: "food",
		distractors: ["Frozen Yogurt", "Sorbet", "Gelato"],
	},
	{
		phrase: "Popcorn",
		emojis: "🍿🎬",
		category: "food",
		distractors: ["Nachos", "Pretzel", "Potato Chips"],
	},
	{
		phrase: "Spill the Tea",
		emojis: "☕️🗣️",
		category: "idiom",
		distractors: ["Break the Ice", "Piece of Cake", "Cry Over Milk"],
	},
	{
		phrase: "Piece of Cake",
		emojis: "🍰😌",
		category: "idiom",
		distractors: ["Easy as Pie", "Cakewalk", "Slice of Life"],
	},
	{
		phrase: "Break a Leg",
		emojis: "🦵💥🎭",
		category: "idiom",
		distractors: ["Cold Feet", "Foot in Mouth", "Twist an Ankle"],
	},
	{
		phrase: "Raining Cats and Dogs",
		emojis: "🌧️🐱🐶",
		category: "idiom",
		distractors: [
			"Cat Got Your Tongue",
			"Let Sleeping Dogs Lie",
			"Fight Like Cats and Dogs",
		],
	},
	{
		phrase: "Cold Shoulder",
		emojis: "🥶💪",
		category: "idiom",
		distractors: ["Cold Feet", "Brain Freeze", "Icy Stare"],
	},
	{
		phrase: "Paris",
		emojis: "🥖🗼",
		category: "place",
		distractors: ["Rome", "Madrid", "Vienna"],
	},
	{
		phrase: "New York",
		emojis: "🗽🏙️",
		category: "place",
		distractors: ["Chicago", "Boston", "San Francisco"],
	},
	{
		phrase: "Tokyo",
		emojis: "🗼🍱🎌",
		category: "place",
		distractors: ["Osaka", "Kyoto", "Seoul"],
	},
	{
		phrase: "Egypt",
		emojis: "🐪🔺",
		category: "place",
		distractors: ["Morocco", "Jordan", "Sudan"],
	},
	{
		phrase: "Australia",
		emojis: "🦘🐨",
		category: "place",
		distractors: ["New Zealand", "Indonesia", "Fiji"],
	},
	{
		phrase: "Titanic",
		emojis: "🚢💔🧊",
		category: "movie",
		distractors: ["The Perfect Storm", "Poseidon", "Noah"],
	},
];
