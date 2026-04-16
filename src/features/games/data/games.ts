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
			"Answer random trivia questions together. Compete to see who knows more useless facts.",
		icon: "brain",
		players: "2 players",
		duration: "~5 min",
		status: "coming_soon",
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
		id: "connect-four",
		name: "Connect Four",
		description:
			"Drop discs into a 7-column grid. First to connect four in a row wins.",
		icon: "circle-dot",
		players: "2 players",
		duration: "~5 min",
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
