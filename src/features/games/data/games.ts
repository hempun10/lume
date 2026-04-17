import type { Game } from "../types";

export const GAMES: Game[] = [
	{
		id: "tic-tac-toe",
		name: "Tic Tac Toe",
		description:
			"Classic 3x3 grid game. Take turns placing X or O — first to get three in a row wins.",
		icon: "grid",
		players: "2 players",
		duration: "~2 min",
		status: "available",
	},
	{
		id: "trivia",
		name: "Trivia",
		description:
			"Six quick multiple-choice questions. Answer blind, reveal together, see who knows more.",
		icon: "brain",
		players: "2 players",
		duration: "~3 min",
		status: "available",
	},
	{
		id: "word-game",
		name: "Word Chain",
		description:
			"Say a word that starts with the last letter of the previous word. Don't repeat or run out of time.",
		icon: "type",
		players: "2 players",
		duration: "~3 min",
		status: "coming_soon",
	},
	{
		id: "chess",
		name: "Chess",
		description:
			"The classic strategy game. Play a full match or a quick blitz round with a stranger.",
		icon: "crown",
		players: "2 players",
		duration: "~15 min",
		status: "coming_soon",
	},
	{
		id: "would-you-rather",
		name: "Would You Rather",
		description:
			"Eight quick either/or prompts. Pick your side, then see where your vibes match.",
		icon: "scale",
		players: "2 players",
		duration: "~3 min",
		status: "available",
	},
	{
		id: "rock-paper-scissors",
		name: "Rock Paper Scissors",
		description:
			"Best of five. Commit blind, reveal together — simple mind games with a stranger.",
		icon: "hand",
		players: "2 players",
		duration: "~2 min",
		status: "available",
	},
	{
		id: "two-truths",
		name: "Two Truths & a Lie",
		description:
			"Six rounds, roles swap each turn. Read three facts, guess which one is a lie.",
		icon: "message-square",
		players: "2 players",
		duration: "~3 min",
		status: "available",
	},
	{
		id: "drawing",
		name: "Draw & Guess",
		description:
			"One person draws, the other guesses. Simple, chaotic, and surprisingly fun.",
		icon: "pencil",
		players: "2 players",
		duration: "~5 min",
		status: "coming_soon",
	},
];
