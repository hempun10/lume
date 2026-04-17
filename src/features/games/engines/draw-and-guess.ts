/**
 * Draw & Guess engine — pure state + numeric move contract.
 *
 * Reuses the `customEvents` side-channel from `useGameRoom` for:
 *   - `round_setup` {options} — drawer broadcasts the 4 MC options on
 *     round start. Correct index stays in drawer's local ref until
 *     reveal.
 *   - `stroke` {points, color, width} — batched pointer points while
 *     drawing (board-level throttle ~50ms).
 *   - `stroke_end` — punctuates a stroke so the receiving canvas
 *     starts a new path on the next `stroke`.
 *   - `clear` — drawer cleared the canvas.
 *   - `fill` {x, y, color} — drawer used the fill bucket at a point.
 *   - `reveal` {correctIdx} — drawer broadcasts the true answer so
 *     both sides can score.
 *
 * Flow per round (4 rounds total, drawer alternates A/B/A/B):
 *   1. `setup` — waiting for drawer to broadcast round_setup. The
 *      board computes this immediately on entering the phase so it's
 *      essentially transient.
 *   2. `drawing` — drawer sketches, guesser picks from 4 options via
 *      the numeric move channel. Drawer may skip to next round (move
 *      = 5) without a guess; guesser can't advance.
 *   3. `revealed` — drawer broadcasts reveal; scoring applied by
 *      `applyReveal`. Either player advances (move = 4) to next
 *      round.
 *
 * Scoring:
 *   - Guesser correct → +1 guesser, +1 drawer (reward both).
 *   - Guesser wrong or timed out → 0/0.
 */

import type {
	GameResult as EngineGameResult,
	GameEngine,
	MoveResult,
	Seat,
} from "./types";

export const DRAW_AND_GUESS_TOTAL_ROUNDS = 4;
export const DRAW_AND_GUESS_ROUND_DURATION_MS = 60_000;
export const DRAW_AND_GUESS_MOVE_ADVANCE = 4;
export const DRAW_AND_GUESS_MOVE_SKIP = 5;

export type DrawAndGuessPick = 0 | 1 | 2 | 3;
export type DrawAndGuessPhase = "setup" | "drawing" | "revealed" | "finished";

export interface DrawAndGuessHistoryEntry {
	drawerSeat: "A" | "B";
	options: readonly [string, string, string, string];
	correctIdx: DrawAndGuessPick;
	guess: DrawAndGuessPick | null;
}

export interface DrawAndGuessState {
	playerA: string;
	playerB: string;
	round: number;
	totalRounds: number;
	/** 4 multiple-choice options for the current round. */
	options: readonly [string, string, string, string] | null;
	/** Guesser's pick. Null until they lock in (or timeout). */
	guess: DrawAndGuessPick | null;
	/** Correct option index. Null until reveal is broadcast. */
	correctIdx: DrawAndGuessPick | null;
	aScore: number;
	bScore: number;
	history: DrawAndGuessHistoryEntry[];
	phase: DrawAndGuessPhase;
}

export function createInitialState(
	playerA: string,
	playerB: string,
): DrawAndGuessState {
	return {
		playerA,
		playerB,
		round: 0,
		totalRounds: DRAW_AND_GUESS_TOTAL_ROUNDS,
		options: null,
		guess: null,
		correctIdx: null,
		aScore: 0,
		bScore: 0,
		history: [],
		phase: "setup",
	};
}

/** Drawer seat: A on even rounds, B on odd. */
export function drawerSeatFor(state: DrawAndGuessState): "A" | "B" {
	return state.round % 2 === 0 ? "A" : "B";
}

export function guesserSeatFor(state: DrawAndGuessState): "A" | "B" {
	return state.round % 2 === 0 ? "B" : "A";
}

function seatOfPlayer(state: DrawAndGuessState, playerId: string): Seat {
	if (playerId === state.playerA) return "A";
	if (playerId === state.playerB) return "B";
	return null;
}

function isPick(move: number): move is DrawAndGuessPick {
	return move === 0 || move === 1 || move === 2 || move === 3;
}

/**
 * Applied by both seats: drawer on its own state when it computes the
 * options locally, guesser via the `round_setup` custom event.
 */
export function applyRoundSetup(
	state: DrawAndGuessState,
	options: readonly [string, string, string, string],
): DrawAndGuessState {
	if (state.phase !== "setup") return state;
	return { ...state, options, phase: "drawing" };
}

/**
 * Applied by both seats: drawer after it broadcasts, guesser via the
 * `reveal` custom event. Scores +1 to both if the guess was correct.
 * A null guess (timeout) scores nothing.
 */
export function applyReveal(
	state: DrawAndGuessState,
	correctIdx: DrawAndGuessPick,
): DrawAndGuessState {
	if (state.phase !== "drawing") return state;

	const correct = state.guess !== null && state.guess === correctIdx;
	const nextAScore = state.aScore + (correct ? 1 : 0);
	const nextBScore = state.bScore + (correct ? 1 : 0);

	return {
		...state,
		correctIdx,
		aScore: nextAScore,
		bScore: nextBScore,
		phase: "revealed",
	};
}

export function applyMove(
	state: DrawAndGuessState,
	move: number,
	playerId: string,
): MoveResult<DrawAndGuessState> {
	if (state.phase === "finished") {
		return { ok: false, error: "Game already finished" };
	}

	const seat = seatOfPlayer(state, playerId);
	if (!seat) return { ok: false, error: "Not a participant" };

	if (move === DRAW_AND_GUESS_MOVE_ADVANCE) {
		if (state.phase !== "revealed") {
			return { ok: false, error: "Can't advance yet" };
		}
		if (state.options === null || state.correctIdx === null) {
			return { ok: false, error: "Round not fully resolved" };
		}

		const nextHistory: DrawAndGuessHistoryEntry[] = [
			...state.history,
			{
				drawerSeat: drawerSeatFor(state),
				options: state.options,
				correctIdx: state.correctIdx,
				guess: state.guess,
			},
		];
		const isLast = state.round + 1 >= state.totalRounds;
		return {
			ok: true,
			state: {
				...state,
				round: isLast ? state.round : state.round + 1,
				options: null,
				guess: null,
				correctIdx: null,
				history: nextHistory,
				phase: isLast ? "finished" : "setup",
			},
		};
	}

	if (!isPick(move)) return { ok: false, error: "Invalid move" };
	if (state.phase !== "drawing") {
		return { ok: false, error: "Not in drawing phase" };
	}

	const guesserSeat = guesserSeatFor(state);
	if (seat !== guesserSeat) {
		return { ok: false, error: "Not the guesser this round" };
	}
	if (state.guess !== null) {
		return { ok: false, error: "Already guessed" };
	}

	return { ok: true, state: { ...state, guess: move } };
}

export const DRAW_AND_GUESS_ENGINE: GameEngine<DrawAndGuessState> = {
	createInitialState,
	applyMove,
	isMyTurn(state, userId) {
		if (state.phase === "finished") return false;
		const seat = seatOfPlayer(state, userId);
		if (!seat) return false;

		if (state.phase === "setup") return seat === drawerSeatFor(state);
		if (state.phase === "drawing") {
			if (state.guess === null) {
				// Drawer is always "active" (drawing); guesser is active
				// until locked in.
				return true;
			}
			return seat === drawerSeatFor(state);
		}
		return true;
	},
	isFinished(state) {
		return state.phase === "finished";
	},
	resultFor(state, userId): EngineGameResult {
		if (state.phase !== "finished") return "playing";
		const seat = seatOfPlayer(state, userId);
		if (!seat) return "playing";
		const mine = seat === "A" ? state.aScore : state.bScore;
		const theirs = seat === "A" ? state.bScore : state.aScore;
		if (mine > theirs) return "won";
		if (mine < theirs) return "lost";
		return "draw";
	},
	seatOf(state, userId) {
		return seatOfPlayer(state, userId);
	},
};
