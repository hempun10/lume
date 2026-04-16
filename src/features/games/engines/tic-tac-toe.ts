/**
 * Tic Tac Toe game engine — pure functions, no React.
 *
 * Board is a 9-element array (indices 0-8), read left-to-right, top-to-bottom.
 * Each cell is null, "X", or "O".
 * user_a is always X (goes first), user_b is always O.
 */

import type { GameResult as EngineGameResult, GameEngine, Seat } from "./types";

export type CellValue = "X" | "O" | null;
export type Board = [
	CellValue,
	CellValue,
	CellValue,
	CellValue,
	CellValue,
	CellValue,
	CellValue,
	CellValue,
	CellValue,
];

export type GameResult = "playing" | "won" | "draw";

export interface TicTacToeState {
	board: Board;
	players: { X: string; O: string };
	currentTurn: "X" | "O";
	winner: "X" | "O" | null;
	winLine: number[] | null;
	result: GameResult;
}

const WIN_LINES: number[][] = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8], // rows
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8], // columns
	[0, 4, 8],
	[2, 4, 6], // diagonals
];

export function createInitialState(
	playerA: string,
	playerB: string,
): TicTacToeState {
	return {
		board: [null, null, null, null, null, null, null, null, null],
		players: { X: playerA, O: playerB },
		currentTurn: "X",
		winner: null,
		winLine: null,
		result: "playing",
	};
}

export function checkWinner(
	board: Board,
): { winner: "X" | "O"; line: number[] } | null {
	for (const line of WIN_LINES) {
		const [a, b, c] = line;
		if (board[a] && board[a] === board[b] && board[a] === board[c]) {
			return { winner: board[a] as "X" | "O", line };
		}
	}
	return null;
}

export function isDraw(board: Board): boolean {
	return board.every((cell) => cell !== null) && checkWinner(board) === null;
}

export function getValidMoves(state: TicTacToeState): number[] {
	if (state.result !== "playing") return [];
	return state.board.reduce<number[]>((moves, cell, i) => {
		if (cell === null) moves.push(i);
		return moves;
	}, []);
}

export function isMyTurn(state: TicTacToeState, userId: string): boolean {
	return (
		state.result === "playing" && state.players[state.currentTurn] === userId
	);
}

export function getMyMark(
	state: TicTacToeState,
	userId: string,
): "X" | "O" | null {
	if (state.players.X === userId) return "X";
	if (state.players.O === userId) return "O";
	return null;
}

export interface MoveResult {
	ok: true;
	state: TicTacToeState;
}

export interface MoveError {
	ok: false;
	error: string;
}

/**
 * Apply a move to the game state. Returns new state or error.
 * Does NOT mutate the input state.
 */
export function applyMove(
	state: TicTacToeState,
	position: number,
	playerId: string,
): MoveResult | MoveError {
	if (state.result !== "playing") {
		return { ok: false, error: "Game is already over" };
	}

	if (state.players[state.currentTurn] !== playerId) {
		return { ok: false, error: "Not your turn" };
	}

	if (position < 0 || position > 8) {
		return { ok: false, error: "Invalid position" };
	}

	if (state.board[position] !== null) {
		return { ok: false, error: "Cell already occupied" };
	}

	const newBoard = [...state.board] as Board;
	newBoard[position] = state.currentTurn;

	const winResult = checkWinner(newBoard);
	const draw = !winResult && isDraw(newBoard);

	const newState: TicTacToeState = {
		board: newBoard,
		players: state.players,
		currentTurn: state.currentTurn === "X" ? "O" : "X",
		winner: winResult?.winner ?? null,
		winLine: winResult?.line ?? null,
		result: winResult ? "won" : draw ? "draw" : "playing",
	};

	return { ok: true, state: newState };
}

function seatOf(state: TicTacToeState, userId: string): Seat {
	if (state.players.X === userId) return "A";
	if (state.players.O === userId) return "B";
	return null;
}

function isFinished(state: TicTacToeState): boolean {
	return state.result !== "playing";
}

function resultFor(state: TicTacToeState, userId: string): EngineGameResult {
	if (state.result === "playing") return "playing";
	if (state.result === "draw") return "draw";
	return state.winner && state.players[state.winner] === userId
		? "won"
		: "lost";
}

export const TIC_TAC_TOE_ENGINE: GameEngine<TicTacToeState, number> = {
	createInitialState,
	applyMove,
	isMyTurn,
	isFinished,
	resultFor,
	seatOf,
};
