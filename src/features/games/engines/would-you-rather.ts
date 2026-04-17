/**
 * Would You Rather game engine — pure functions, no React.
 *
 * Unlike Tic Tac Toe / Connect Four, WYR is simultaneous, not
 * turn-based: both players can submit a pick at the same time. The
 * engine models this with a three-phase per-prompt lifecycle:
 *
 *   picking → revealed → (next prompt or finished)
 *
 * Moves are encoded as a single integer so the engine fits the shared
 * `GameEngine<State, number>` contract:
 *
 *   0 = pick left      (valid in `picking`, only from a seat that
 *                       hasn't picked yet)
 *   1 = pick right
 *   2 = advance        (valid in `revealed`, either seat may send it;
 *                       second arrival is silently rejected)
 *
 * Prompt order is seeded deterministically from the ordered pair of
 * player ids, so both clients independently compute the same shuffle
 * without sharing DB state. Swapping the pair (which `useGameRoom`
 * does on rematch) produces a fresh ordering — rematches feel new.
 */

import { WYR_PROMPTS } from "../data/would-you-rather-prompts";
import type {
	GameResult as EngineGameResult,
	GameEngine,
	MoveResult,
	Seat,
} from "./types";

export const WYR_TOTAL_ROUNDS = 8;
export const WYR_MOVE_PICK_LEFT = 0;
export const WYR_MOVE_PICK_RIGHT = 1;
export const WYR_MOVE_ADVANCE = 2;

export type WYRPick = 0 | 1;
export type WYRPhase = "picking" | "revealed" | "finished";

export interface WYRHistoryEntry {
	promptIdx: number;
	aPick: WYRPick;
	bPick: WYRPick;
}

export interface WouldYouRatherState {
	playerA: string;
	playerB: string;
	promptOrder: number[];
	round: number;
	totalRounds: number;
	aPick: WYRPick | null;
	bPick: WYRPick | null;
	history: WYRHistoryEntry[];
	phase: WYRPhase;
}

/**
 * Deterministic 32-bit hash of a string (cyrb53-style, trimmed).
 * Only needs to be stable across clients, not cryptographically
 * strong.
 */
function hashString(input: string): number {
	let h = 0x811c9dc5;
	for (let i = 0; i < input.length; i++) {
		h ^= input.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	return h >>> 0;
}

/**
 * Mulberry32 PRNG. Tiny, fast, and deterministic — identical output
 * for the same seed on every machine.
 */
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

function shuffledPromptOrder(playerA: string, playerB: string): number[] {
	const indices = Array.from({ length: WYR_PROMPTS.length }, (_, i) => i);
	const rng = mulberry32(hashString(`${playerA}|${playerB}`));
	for (let i = indices.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		const ai = indices[i];
		const aj = indices[j];
		if (ai !== undefined && aj !== undefined) {
			indices[i] = aj;
			indices[j] = ai;
		}
	}
	return indices.slice(0, WYR_TOTAL_ROUNDS);
}

export function createInitialState(
	playerA: string,
	playerB: string,
): WouldYouRatherState {
	return {
		playerA,
		playerB,
		promptOrder: shuffledPromptOrder(playerA, playerB),
		round: 0,
		totalRounds: WYR_TOTAL_ROUNDS,
		aPick: null,
		bPick: null,
		history: [],
		phase: "picking",
	};
}

export function currentPrompt(state: WouldYouRatherState) {
	const idx = state.promptOrder[state.round];
	if (idx === undefined) return null;
	return WYR_PROMPTS[idx] ?? null;
}

function seatOfPlayer(state: WouldYouRatherState, playerId: string): Seat {
	if (playerId === state.playerA) return "A";
	if (playerId === state.playerB) return "B";
	return null;
}

export function applyMove(
	state: WouldYouRatherState,
	move: number,
	playerId: string,
): MoveResult<WouldYouRatherState> {
	if (state.phase === "finished") {
		return { ok: false, error: "Game already finished" };
	}

	const seat = seatOfPlayer(state, playerId);
	if (!seat) return { ok: false, error: "Not a participant" };

	if (move === WYR_MOVE_ADVANCE) {
		if (state.phase !== "revealed") {
			return { ok: false, error: "Can't advance while picking" };
		}
		const promptIdx = state.promptOrder[state.round];
		if (
			promptIdx === undefined ||
			state.aPick === null ||
			state.bPick === null
		) {
			return { ok: false, error: "Picks missing" };
		}
		const nextHistory: WYRHistoryEntry[] = [
			...state.history,
			{ promptIdx, aPick: state.aPick, bPick: state.bPick },
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
				phase: isLast ? "finished" : "picking",
			},
		};
	}

	if (move !== WYR_MOVE_PICK_LEFT && move !== WYR_MOVE_PICK_RIGHT) {
		return { ok: false, error: "Invalid move" };
	}

	if (state.phase !== "picking") {
		return { ok: false, error: "Not in picking phase" };
	}

	const pick = move as WYRPick;
	if (seat === "A") {
		if (state.aPick !== null) return { ok: false, error: "Already picked" };
		const nextA = pick;
		const nextPhase: WYRPhase = state.bPick !== null ? "revealed" : "picking";
		return {
			ok: true,
			state: { ...state, aPick: nextA, phase: nextPhase },
		};
	}
	// seat B
	if (state.bPick !== null) return { ok: false, error: "Already picked" };
	const nextB = pick;
	const nextPhase: WYRPhase = state.aPick !== null ? "revealed" : "picking";
	return {
		ok: true,
		state: { ...state, bPick: nextB, phase: nextPhase },
	};
}

export function agreementCount(state: WouldYouRatherState): number {
	return state.history.filter((h) => h.aPick === h.bPick).length;
}

export const WOULD_YOU_RATHER_ENGINE: GameEngine<WouldYouRatherState> = {
	createInitialState,
	applyMove,
	isMyTurn(state, userId) {
		if (state.phase === "finished") return false;
		const seat = seatOfPlayer(state, userId);
		if (!seat) return false;
		if (state.phase === "revealed") return true;
		// picking: your turn iff you haven't picked yet.
		return seat === "A" ? state.aPick === null : state.bPick === null;
	},
	isFinished(state) {
		return state.phase === "finished";
	},
	resultFor(): EngineGameResult {
		// WYR is cooperative / conversational — nobody wins or loses.
		// Return "draw" on finish so the generic rematch UI renders
		// cleanly; the board itself shows the agreement tally.
		return "draw";
	},
	seatOf(state, userId) {
		return seatOfPlayer(state, userId);
	},
};
