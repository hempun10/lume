/**
 * Two Truths and a Lie engine — pure functions, no React.
 *
 * Flow per round:
 *   1. One seat is the *reader* (shows all three statements).
 *      The other seat is the *guesser*.
 *   2. Guesser picks 0, 1, or 2 — which one is the lie.
 *   3. Engine reveals the real lie index and scores +1 if correct.
 *   4. Either player advances to the next round.
 *   5. Roles alternate every round so both players guess and read.
 *
 * Triples come from a curated bank. The correct lie index lives in
 * shared state (both clients know it); the board UI hides it from the
 * guesser until they commit — same trick the trivia board uses to hide
 * the "correct answer" until reveal.
 *
 * Moves encoded as a single integer:
 *
 *   0–2 = guesser picks that index as the lie
 *   3   = advance (valid only in `revealed`; second arrival silently
 *         rejected)
 *
 * Triple order is seeded deterministically from the ordered player pair
 * plus a game-specific suffix, matching the trivia/WYR pattern. Swapping
 * the pair (rematch) yields a fresh shuffle.
 */

import {
	TWO_TRUTHS_TRIPLES,
	type TwoTruthsTriple,
} from "../data/two-truths-triples";
import type {
	GameResult as EngineGameResult,
	GameEngine,
	MoveResult,
	Seat,
} from "./types";

export const TWO_TRUTHS_TOTAL_ROUNDS = 6;
export const TWO_TRUTHS_MOVE_ADVANCE = 3;

export type TwoTruthsPick = 0 | 1 | 2;
export type TwoTruthsPhase = "guessing" | "revealed" | "finished";

export interface TwoTruthsHistoryEntry {
	tripleIdx: number;
	readerSeat: "A" | "B";
	guess: TwoTruthsPick;
	correct: TwoTruthsPick;
}

export interface TwoTruthsState {
	playerA: string;
	playerB: string;
	tripleOrder: number[];
	round: number;
	totalRounds: number;
	/** Guesser's current-round pick. Null until they commit. */
	guess: TwoTruthsPick | null;
	aScore: number;
	bScore: number;
	history: TwoTruthsHistoryEntry[];
	phase: TwoTruthsPhase;
}

/** Deterministic 32-bit hash (FNV-1a). */
function hashString(input: string): number {
	let h = 0x811c9dc5;
	for (let i = 0; i < input.length; i++) {
		h ^= input.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	return h >>> 0;
}

function mulberry32(seed: number) {
	let s = seed >>> 0;
	return () => {
		s = (s + 0x6d2b79f5) >>> 0;
		let t = s;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function shuffledTripleOrder(playerA: string, playerB: string): number[] {
	const indices = Array.from(
		{ length: TWO_TRUTHS_TRIPLES.length },
		(_, i) => i,
	);
	const rng = mulberry32(hashString(`${playerA}|${playerB}|two-truths`));
	for (let i = indices.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		const ai = indices[i];
		const aj = indices[j];
		if (ai !== undefined && aj !== undefined) {
			indices[i] = aj;
			indices[j] = ai;
		}
	}
	return indices.slice(0, TWO_TRUTHS_TOTAL_ROUNDS);
}

export function createInitialState(
	playerA: string,
	playerB: string,
): TwoTruthsState {
	return {
		playerA,
		playerB,
		tripleOrder: shuffledTripleOrder(playerA, playerB),
		round: 0,
		totalRounds: TWO_TRUTHS_TOTAL_ROUNDS,
		guess: null,
		aScore: 0,
		bScore: 0,
		history: [],
		phase: "guessing",
	};
}

export function currentTriple(state: TwoTruthsState): TwoTruthsTriple | null {
	const idx = state.tripleOrder[state.round];
	if (idx === undefined) return null;
	return TWO_TRUTHS_TRIPLES[idx] ?? null;
}

/** Which seat is the reader this round. Seat A on even rounds, B on odd. */
export function readerSeatFor(state: TwoTruthsState): "A" | "B" {
	return state.round % 2 === 0 ? "A" : "B";
}

/** Which seat is the guesser this round. */
export function guesserSeatFor(state: TwoTruthsState): "A" | "B" {
	return state.round % 2 === 0 ? "B" : "A";
}

function seatOfPlayer(state: TwoTruthsState, playerId: string): Seat {
	if (playerId === state.playerA) return "A";
	if (playerId === state.playerB) return "B";
	return null;
}

function isPick(move: number): move is TwoTruthsPick {
	return move === 0 || move === 1 || move === 2;
}

export function applyMove(
	state: TwoTruthsState,
	move: number,
	playerId: string,
): MoveResult<TwoTruthsState> {
	if (state.phase === "finished") {
		return { ok: false, error: "Game already finished" };
	}

	const seat = seatOfPlayer(state, playerId);
	if (!seat) return { ok: false, error: "Not a participant" };

	if (move === TWO_TRUTHS_MOVE_ADVANCE) {
		if (state.phase !== "revealed") {
			return { ok: false, error: "Can't advance while guessing" };
		}
		const tripleIdx = state.tripleOrder[state.round];
		if (tripleIdx === undefined || state.guess === null) {
			return { ok: false, error: "Guess missing" };
		}
		const triple = TWO_TRUTHS_TRIPLES[tripleIdx];
		if (!triple) return { ok: false, error: "Triple missing" };

		const nextHistory: TwoTruthsHistoryEntry[] = [
			...state.history,
			{
				tripleIdx,
				readerSeat: readerSeatFor(state),
				guess: state.guess,
				correct: triple.lieIdx,
			},
		];
		const isLast = state.round + 1 >= state.totalRounds;
		return {
			ok: true,
			state: {
				...state,
				round: isLast ? state.round : state.round + 1,
				guess: null,
				history: nextHistory,
				phase: isLast ? "finished" : "guessing",
			},
		};
	}

	if (!isPick(move)) return { ok: false, error: "Invalid move" };
	if (state.phase !== "guessing") {
		return { ok: false, error: "Not in guessing phase" };
	}

	const guesserSeat = guesserSeatFor(state);
	if (seat !== guesserSeat) {
		return { ok: false, error: "Not the guesser this round" };
	}
	if (state.guess !== null) {
		return { ok: false, error: "Already guessed" };
	}

	const triple = currentTriple(state);
	if (!triple) return { ok: false, error: "No current triple" };

	const correct = move === triple.lieIdx;
	const nextAScore = state.aScore + (correct && seat === "A" ? 1 : 0);
	const nextBScore = state.bScore + (correct && seat === "B" ? 1 : 0);

	return {
		ok: true,
		state: {
			...state,
			guess: move,
			aScore: nextAScore,
			bScore: nextBScore,
			phase: "revealed",
		},
	};
}

export const TWO_TRUTHS_ENGINE: GameEngine<TwoTruthsState> = {
	createInitialState,
	applyMove,
	isMyTurn(state, userId) {
		if (state.phase === "finished") return false;
		const seat = seatOfPlayer(state, userId);
		if (!seat) return false;
		if (state.phase === "revealed") return true;
		// guessing phase: only the guesser has a turn.
		return seat === guesserSeatFor(state);
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
