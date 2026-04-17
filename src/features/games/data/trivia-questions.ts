/**
 * Trivia question bank. Gen-Z friendly, light, mix of pop culture,
 * general knowledge, and random fun facts. Four options each,
 * `answer` is the index (0–3) of the correct option.
 *
 * Keep questions short — they render on mobile. Options should
 * be short too (≤20 chars ideally).
 */

export interface TriviaQuestion {
	q: string;
	options: [string, string, string, string];
	answer: 0 | 1 | 2 | 3;
}

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
	{
		q: "Which planet is known as the Red Planet?",
		options: ["Venus", "Mars", "Jupiter", "Saturn"],
		answer: 1,
	},
	{
		q: "What does 'GOAT' stand for in internet slang?",
		options: [
			"Good On Any Team",
			"Greatest Of All Time",
			"Gone Out At Ten",
			"Get Over Anyone's Troubles",
		],
		answer: 1,
	},
	{
		q: "How many continents are there?",
		options: ["5", "6", "7", "8"],
		answer: 2,
	},
	{
		q: "Which company makes the iPhone?",
		options: ["Samsung", "Google", "Apple", "Microsoft"],
		answer: 2,
	},
	{
		q: "What year did TikTok launch globally?",
		options: ["2014", "2016", "2018", "2020"],
		answer: 2,
	},
	{
		q: "What's the largest ocean on Earth?",
		options: ["Atlantic", "Indian", "Arctic", "Pacific"],
		answer: 3,
	},
	{
		q: "Who painted the Mona Lisa?",
		options: ["Van Gogh", "Da Vinci", "Picasso", "Monet"],
		answer: 1,
	},
	{
		q: "What does 'Wi-Fi' stand for?",
		options: [
			"Wireless Fidelity",
			"Nothing — it's just a name",
			"Wired Fast",
			"Web Interface",
		],
		answer: 1,
	},
	{
		q: "Which country invented pizza?",
		options: ["France", "Italy", "Greece", "Spain"],
		answer: 1,
	},
	{
		q: "How many sides does a hexagon have?",
		options: ["5", "6", "7", "8"],
		answer: 1,
	},
	{
		q: "What's the most spoken language in the world?",
		options: ["English", "Spanish", "Mandarin", "Hindi"],
		answer: 2,
	},
	{
		q: "Which Pokémon is #1 in the Pokédex?",
		options: ["Pikachu", "Bulbasaur", "Charmander", "Mew"],
		answer: 1,
	},
	{
		q: "What's the smallest country in the world?",
		options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
		answer: 1,
	},
	{
		q: "Who created Minecraft?",
		options: ["Notch", "Jeff Bezos", "Elon Musk", "John Carmack"],
		answer: 0,
	},
	{
		q: "What does 'HTTP' stand for?",
		options: [
			"HyperText Transfer Protocol",
			"High Tech Transfer Process",
			"Home Tool Transfer Page",
			"HyperText Technical Path",
		],
		answer: 0,
	},
	{
		q: "Which artist has the most Grammys ever?",
		options: ["Taylor Swift", "Beyoncé", "Kanye West", "Stevie Wonder"],
		answer: 1,
	},
	{
		q: "What's the tallest mountain on Earth?",
		options: ["K2", "Everest", "Kilimanjaro", "Denali"],
		answer: 1,
	},
	{
		q: "How many bones are in the adult human body?",
		options: ["186", "206", "226", "246"],
		answer: 1,
	},
	{
		q: "What year did the first Harry Potter book come out?",
		options: ["1995", "1997", "1999", "2001"],
		answer: 1,
	},
	{
		q: "What's the chemical symbol for gold?",
		options: ["Gd", "Go", "Au", "Ag"],
		answer: 2,
	},
	{
		q: "Which streaming service made 'Stranger Things'?",
		options: ["HBO", "Netflix", "Disney+", "Hulu"],
		answer: 1,
	},
	{
		q: "What does 'NPC' stand for?",
		options: [
			"New Player Character",
			"Non-Player Character",
			"Next-Page Code",
			"Near Point Control",
		],
		answer: 1,
	},
	{
		q: "Which country has the most time zones?",
		options: ["USA", "Russia", "France", "China"],
		answer: 2,
	},
	{
		q: "What's the fastest land animal?",
		options: ["Lion", "Cheetah", "Horse", "Greyhound"],
		answer: 1,
	},
	{
		q: "Who founded SpaceX?",
		options: ["Jeff Bezos", "Elon Musk", "Richard Branson", "Bill Gates"],
		answer: 1,
	},
	{
		q: "What's the most downloaded app of all time?",
		options: ["Instagram", "TikTok", "Facebook", "WhatsApp"],
		answer: 1,
	},
	{
		q: "How many strings does a standard guitar have?",
		options: ["4", "6", "7", "8"],
		answer: 1,
	},
	{
		q: "What's the capital of Australia?",
		options: ["Sydney", "Melbourne", "Canberra", "Perth"],
		answer: 2,
	},
	{
		q: "Which game franchise features Mario?",
		options: ["Sega", "Atari", "Nintendo", "Xbox"],
		answer: 2,
	},
	{
		q: "What's the largest desert in the world?",
		options: ["Sahara", "Gobi", "Kalahari", "Antarctic"],
		answer: 3,
	},
	{
		q: "Who wrote 'Romeo and Juliet'?",
		options: ["Chaucer", "Shakespeare", "Dickens", "Austen"],
		answer: 1,
	},
	{
		q: "What year did YouTube launch?",
		options: ["2003", "2005", "2007", "2009"],
		answer: 1,
	},
	{
		q: "What's the rarest blood type?",
		options: ["O-", "AB-", "B-", "A-"],
		answer: 1,
	},
	{
		q: "Which social app is owned by Meta?",
		options: ["TikTok", "Snapchat", "Instagram", "Discord"],
		answer: 2,
	},
	{
		q: "What does 'RGB' stand for?",
		options: [
			"Red Green Blue",
			"Real Good Brightness",
			"Radial Gradient Base",
			"Range Gain Buffer",
		],
		answer: 0,
	},
	{
		q: "How long is one lap at the Olympics in track?",
		options: ["100m", "200m", "400m", "800m"],
		answer: 2,
	},
	{
		q: "What's the longest river in the world?",
		options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
		answer: 1,
	},
	{
		q: "Who voices the original Shrek?",
		options: ["Mike Myers", "Eddie Murphy", "Adam Sandler", "Will Smith"],
		answer: 0,
	},
	{
		q: "What's 7 × 8?",
		options: ["54", "56", "58", "64"],
		answer: 1,
	},
	{
		q: "Which billionaire owns X (formerly Twitter)?",
		options: ["Jeff Bezos", "Mark Zuckerberg", "Elon Musk", "Larry Page"],
		answer: 2,
	},
];
