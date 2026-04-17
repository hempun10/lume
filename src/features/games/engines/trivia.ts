/**
 * Trivia game engine — pure functions, no React.
 *
 * Simultaneous multiple-choice: both players pick an answer (0–3)
 * independently, the engine reveals both picks + the correct answer
 * on the second commit, and either player advances to the next round.
 *
 * Moves encoded as a single integer:
 *
 *   0–3 = pick option at that index (valid in `answering`, only
 *         from a seat that hasn't picked yet)
 *   4   = advance (valid in `revealed`; second arrival is silently
 *         rejected)
 *
 * Question order is seeded deterministically from the ordered pair of
 * player ids so both clients independently compute the same shuffle.
 * Swapping the pair (which `useGameRoom` does on rematch) produces a
 * fresh ordering.
 */

import {
	TRIVIA_QUESTIONS,
	type TriviaQuestion,
} from "../data/trivia-questions";
import type {
	GameResult as EngineGameResult,
	GameEngine,
	MoveResult,
	Seat,
} from "./types";

export const TRIVIA_TOTAL_ROUNDS = 6;
export const TRIVIA_MOVE_ADVANCE = 4;

export type TriviaPick = 0 | 1 | 2 | 3;
export type TriviaPhase = "answering" | "revealed" | "finished";

export interface TriviaHistoryEntry {
	questionIdx: number;
	aPick: TriviaPick;
	bPick: TriviaPick;
	correct: TriviaPick;
}

export interface TriviaState {
	playerA: string;
	playerB: string;
	questionOrder: number[];
	round: number;
	totalRounds: number;
	aPick: TriviaPick | null;
	bPick: TriviaPick | null;
	aScore: number;
	bScore: number;
	history: TriviaHistoryEntry[];
	phase: TriviaPhase;
}

/** Deterministic 32-bit hash (cyrb53-style). */
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

function shuffledQuestionOrder(playerA: string, playerB: string): number[] {
	const indices = Array.from({ length: TRIVIA_QUESTIONS.length }, (_, i) => i);
	const rng = mulberry32(hashString(`${playerA}|${playerB}|trivia`));
	for (let i = indices.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		const ai = indices[i];
		const aj = indices[j];
		if (ai !== undefined && aj !== undefined) {
			indices[i] = aj;
			indices[j] = ai;
		}
	}
	return indices.slice(0, TRIVIA_TOTAL_ROUNDS);
}

export function createInitialState(
	playerA: string,
	playerB: string,
): TriviaState {
	return {
		playerA,
		playerB,
		questionOrder: shuffledQuestionOrder(playerA, playerB),
		round: 0,
		totalRounds: TRIVIA_TOTAL_ROUNDS,
		aPick: null,
		bPick: null,
		aScore: 0,
		bScore: 0,
		history: [],
		phase: "answering",
	};
}

export function currentQuestion(state: TriviaState): TriviaQuestion | null {
	const idx = state.questionOrder[state.round];
	if (idx === undefined) return null;
	return TRIVIA_QUESTIONS[idx] ?? null;
}

function seatOfPlayer(state: TriviaState, playerId: string): Seat {
	if (playerId === state.playerA) return "A";
	if (playerId === state.playerB) return "B";
	return null;
}

function isPick(move: number): move is TriviaPick {
	return move === 0 || move === 1 || move === 2 || move === 3;
}

export function applyMove(
	state: TriviaState,
	move: number,
	playerId: string,
): MoveResult<TriviaState> {
	if (state.phase === "finished") {
		return { ok: false, error: "Game already finished" };
	}

	const seat = seatOfPlayer(state, playerId);
	if (!seat) return { ok: false, error: "Not a participant" };

	if (move === TRIVIA_MOVE_ADVANCE) {
		if (state.phase !== "revealed") {
			return { ok: false, error: "Can't advance while answering" };
		}
		const questionIdx = state.questionOrder[state.round];
		if (
			questionIdx === undefined ||
			state.aPick === null ||
			state.bPick === null
		) {
			return { ok: false, error: "Picks missing" };
		}
		const question = TRIVIA_QUESTIONS[questionIdx];
		if (!question) return { ok: false, error: "Question missing" };

		const nextHistory: TriviaHistoryEntry[] = [
			...state.history,
			{
				questionIdx,
				aPick: state.aPick,
				bPick: state.bPick,
				correct: question.answer,
			},
		];
		const isLast = state.round + 1 >= state.totalRounds;
		return {
			ok: true,
			state: {
				...state,
				round: isLast ? state.round : state.round + 1,
				aPick: null,
				bPick: null,
				history: nextHistory,
				phase: isLast ? "finished" : "answering",
			},
		};
	}

	if (!isPick(move)) return { ok: false, error: "Invalid move" };
	if (state.phase !== "answering") {
		return { ok: false, error: "Not in answering phase" };
	}

	const question = currentQuestion(state);
	if (!question) return { ok: false, error: "No current question" };

	const scoreDelta = move === question.answer ? 1 : 0;

	if (seat === "A") {
		if (state.aPick !== null) return { ok: false, error: "Already answered" };
		const nextAScore = state.aScore + scoreDelta;
		const nextPhase: TriviaPhase =
			state.bPick !== null ? "revealed" : "answering";
		return {
			ok: true,
			state: {
				...state,
				aPick: move,
				aScore: nextAScore,
				phase: nextPhase,
			},
		};
	}
	// seat B
	if (state.bPick !== null) return { ok: false, error: "Already answered" };
	const nextBScore = state.bScore + scoreDelta;
	const nextPhase: TriviaPhase =
		state.aPick !== null ? "revealed" : "answering";
	return {
		ok: true,
		state: {
			...state,
			bPick: move,
			bScore: nextBScore,
			phase: nextPhase,
		},
	};
}

export const TRIVIA_ENGINE: GameEngine<TriviaState> = {
	createInitialState,
	applyMove,
	isMyTurn(state, userId) {
		if (state.phase === "finished") return false;
		const seat = seatOfPlayer(state, userId);
		if (!seat) return false;
		if (state.phase === "revealed") return true;
		return seat === "A" ? state.aPick === null : state.bPick === null;
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
