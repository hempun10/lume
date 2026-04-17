/**
 * Connect Four engine — 7 columns × 6 rows, gravity from the top.
 *
 * Board is a flat 42-cell array. Index = row * 7 + col, where row 0
 * is the top row and row 5 is the bottom. Cells are "R" (red), "Y"
 * (yellow), or null.
 *
 * player_a (Red) goes first; player_b (Yellow) goes second.
 */

import type { GameEngine, GameResult, MoveResult, Seat } from "./types";

export const COLS = 7;
export const ROWS = 6;
export const CELLS = COLS * ROWS;

export type Disc = "R" | "Y" | null;
export type Board = Disc[];

export type RoundResult = "playing" | "won" | "draw";

export interface ConnectFourState {
	board: Board;
	players: { R: string; Y: string };
	currentTurn: "R" | "Y";
	winner: "R" | "Y" | null;
	winLine: number[] | null;
	result: RoundResult;
}

function emptyBoard(): Board {
	return new Array(CELLS).fill(null);
}

export function createInitialState(
	playerA: string,
	playerB: string,
): ConnectFourState {
	return {
		board: emptyBoard(),
		players: { R: playerA, Y: playerB },
		currentTurn: "R",
		winner: null,
		winLine: null,
		result: "playing",
	};
}

/**
 * Find the lowest empty row in a given column. Returns -1 if full.
 */
export function lowestEmptyRow(board: Board, col: number): number {
	if (col < 0 || col >= COLS) return -1;
	for (let row = ROWS - 1; row >= 0; row--) {
		if (board[row * COLS + col] === null) return row;
	}
	return -1;
}

const DIRECTIONS: Array<[number, number]> = [
	[0, 1], // horizontal →
	[1, 0], // vertical ↓
	[1, 1], // diagonal ↘
	[1, -1], // diagonal ↙
];

/**
 * Starting from a freshly-placed cell, scan all four axes for a run
 * of 4+ matching discs. Returns the winning cell indices on success.
 */
export function findWinLine(
	board: Board,
	row: number,
	col: number,
): number[] | null {
	const disc = board[row * COLS + col];
	if (!disc) return null;

	for (const [dr, dc] of DIRECTIONS) {
		const line: number[] = [row * COLS + col];

		// forward
		let r = row + dr;
		let c = col + dc;
		while (
			r >= 0 &&
			r < ROWS &&
			c >= 0 &&
			c < COLS &&
			board[r * COLS + c] === disc
		) {
			line.push(r * COLS + c);
			r += dr;
			c += dc;
		}

		// backward
		r = row - dr;
		c = col - dc;
		while (
			r >= 0 &&
			r < ROWS &&
			c >= 0 &&
			c < COLS &&
			board[r * COLS + c] === disc
		) {
			line.unshift(r * COLS + c);
			r -= dr;
			c -= dc;
		}

		if (line.length >= 4) return line.slice(0, 4);
	}

	return null;
}

export function isBoardFull(board: Board): boolean {
	return board.every((c) => c !== null);
}

export function applyMove(
	state: ConnectFourState,
	column: number,
	playerId: string,
): MoveResult<ConnectFourState> {
	if (state.result !== "playing") {
		return { ok: false, error: "Game is already over" };
	}

	if (state.players[state.currentTurn] !== playerId) {
		return { ok: false, error: "Not your turn" };
	}

	const row = lowestEmptyRow(state.board, column);
	if (row === -1) {
		return { ok: false, error: "Column is full or out of range" };
	}

	const newBoard = [...state.board];
	newBoard[row * COLS + column] = state.currentTurn;

	const winLine = findWinLine(newBoard, row, column);
	const full = !winLine && isBoardFull(newBoard);

	const nextState: ConnectFourState = {
		board: newBoard,
		players: state.players,
		currentTurn: state.currentTurn === "R" ? "Y" : "R",
		winner: winLine ? state.currentTurn : null,
		winLine,
		result: winLine ? "won" : full ? "draw" : "playing",
	};

	return { ok: true, state: nextState };
}

export function isMyTurn(state: ConnectFourState, userId: string): boolean {
	return (
		state.result === "playing" && state.players[state.currentTurn] === userId
	);
}

export function getMyDisc(
	state: ConnectFourState,
	userId: string,
): "R" | "Y" | null {
	if (state.players.R === userId) return "R";
	if (state.players.Y === userId) return "Y";
	return null;
}

function seatOf(state: ConnectFourState, userId: string): Seat {
	if (state.players.R === userId) return "A";
	if (state.players.Y === userId) return "B";
	return null;
}

function isFinished(state: ConnectFourState): boolean {
	return state.result !== "playing";
}

function resultFor(state: ConnectFourState, userId: string): GameResult {
	if (state.result === "playing") return "playing";
	if (state.result === "draw") return "draw";
	return state.winner && state.players[state.winner] === userId
		? "won"
		: "lost";
}

export const CONNECT_FOUR_ENGINE: GameEngine<ConnectFourState, number> = {
	createInitialState,
	applyMove,
	isMyTurn,
	isFinished,
	resultFor,
	seatOf,
};
