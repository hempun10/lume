/**
 * Emoji Charades engine — pure functions, no React.
 *
 * Flow per round:
 *   1. One seat is the *revealer* (sees the full phrase and its emoji
 *      clue). The other seat is the *guesser* and sees only the emojis
 *      plus four text options (correct + three distractors), shuffled
 *      deterministically so both clients agree on button order.
 *   2. Guesser picks 0–3.
 *   3. Engine reveals the correct option and scores +1 if right.
 *   4. Either player advances to the next round.
 *   5. Roles alternate every round so both players get to reveal and
 *      guess.
 *
 * Moves encoded as a single integer:
 *
 *   0–3 = guesser picks that option index as the answer
 *   4   = advance (valid only in `revealed`; second arrival silently
 *         rejected)
 *
 * Phrase order is seeded deterministically from the ordered player pair
 * plus the game id, matching the two-truths/trivia/WYR pattern. Option
 * order inside a round is seeded with the round index folded in so each
 * round has its own button layout without blowing up state.
 */

import {
	EMOJI_CHARADES_PHRASES,
	type EmojiCharadesPhrase,
} from "../data/emoji-charades-phrases";
import type {
	GameResult as EngineGameResult,
	GameEngine,
	MoveResult,
	Seat,
} from "./types";

export const EMOJI_CHARADES_TOTAL_ROUNDS = 6;
export const EMOJI_CHARADES_OPTIONS_PER_ROUND = 4;
export const EMOJI_CHARADES_MOVE_ADVANCE = 4;

export type EmojiCharadesPick = 0 | 1 | 2 | 3;
export type EmojiCharadesPhase = "guessing" | "revealed" | "finished";

export interface EmojiCharadesHistoryEntry {
	phraseIdx: number;
	revealerSeat: "A" | "B";
	guess: EmojiCharadesPick;
	/** Index within the shuffled option layout for this round. */
	correct: EmojiCharadesPick;
}

export interface EmojiCharadesState {
	playerA: string;
	playerB: string;
	phraseOrder: number[];
	round: number;
	totalRounds: number;
	/** Guesser's current-round pick, index into the shuffled options. */
	guess: EmojiCharadesPick | null;
	aScore: number;
	bScore: number;
	history: EmojiCharadesHistoryEntry[];
	phase: EmojiCharadesPhase;
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

function shuffledPhraseOrder(playerA: string, playerB: string): number[] {
	const indices = Array.from(
		{ length: EMOJI_CHARADES_PHRASES.length },
		(_, i) => i,
	);
	const rng = mulberry32(hashString(`${playerA}|${playerB}|emoji-charades`));
	for (let i = indices.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		const ai = indices[i];
		const aj = indices[j];
		if (ai !== undefined && aj !== undefined) {
			indices[i] = aj;
			indices[j] = ai;
		}
	}
	return indices.slice(0, EMOJI_CHARADES_TOTAL_ROUNDS);
}

/**
 * Resolve the four options (correct + three distractors) in a
 * deterministic shuffled order for a given round. Both clients run
 * this and get the same layout. Returns the options in display order
 * plus the index of the correct option within that layout.
 */
export function optionsForRound(
	state: EmojiCharadesState,
	round: number,
): { options: string[]; correctIdx: EmojiCharadesPick } | null {
	const phraseIdx = state.phraseOrder[round];
	if (phraseIdx === undefined) return null;
	const phrase = EMOJI_CHARADES_PHRASES[phraseIdx];
	if (!phrase) return null;

	const options = [phrase.phrase, ...phrase.distractors];
	const rng = mulberry32(
		hashString(
			`${state.playerA}|${state.playerB}|emoji-charades|options|${round}`,
		),
	);
	for (let i = options.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		const ai = options[i];
		const aj = options[j];
		if (ai !== undefined && aj !== undefined) {
			options[i] = aj;
			options[j] = ai;
		}
	}
	const correctIdx = options.indexOf(phrase.phrase) as EmojiCharadesPick;
	return { options, correctIdx };
}

export function currentPhrase(
	state: EmojiCharadesState,
): EmojiCharadesPhrase | null {
	const idx = state.phraseOrder[state.round];
	if (idx === undefined) return null;
	return EMOJI_CHARADES_PHRASES[idx] ?? null;
}

/** Seat A reveals on even rounds, seat B on odd. */
export function revealerSeatFor(state: EmojiCharadesState): "A" | "B" {
	return state.round % 2 === 0 ? "A" : "B";
}

export function guesserSeatFor(state: EmojiCharadesState): "A" | "B" {
	return state.round % 2 === 0 ? "B" : "A";
}

export function createInitialState(
	playerA: string,
	playerB: string,
): EmojiCharadesState {
	return {
		playerA,
		playerB,
		phraseOrder: shuffledPhraseOrder(playerA, playerB),
		round: 0,
		totalRounds: EMOJI_CHARADES_TOTAL_ROUNDS,
		guess: null,
		aScore: 0,
		bScore: 0,
		history: [],
		phase: "guessing",
	};
}

function seatOfPlayer(state: EmojiCharadesState, playerId: string): Seat {
	if (playerId === state.playerA) return "A";
	if (playerId === state.playerB) return "B";
	return null;
}

function isPick(move: number): move is EmojiCharadesPick {
	return move === 0 || move === 1 || move === 2 || move === 3;
}

export function applyMove(
	state: EmojiCharadesState,
	move: number,
	playerId: string,
): MoveResult<EmojiCharadesState> {
	if (state.phase === "finished") {
		return { ok: false, error: "Game already finished" };
	}

	const seat = seatOfPlayer(state, playerId);
	if (!seat) return { ok: false, error: "Not a participant" };

	if (move === EMOJI_CHARADES_MOVE_ADVANCE) {
		if (state.phase !== "revealed") {
			return { ok: false, error: "Can't advance while guessing" };
		}
		const phraseIdx = state.phraseOrder[state.round];
		if (phraseIdx === undefined || state.guess === null) {
			return { ok: false, error: "Guess missing" };
		}
		const layout = optionsForRound(state, state.round);
		if (!layout) return { ok: false, error: "Options missing" };

		const nextHistory: EmojiCharadesHistoryEntry[] = [
			...state.history,
			{
				phraseIdx,
				revealerSeat: revealerSeatFor(state),
				guess: state.guess,
				correct: layout.correctIdx,
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

	const layout = optionsForRound(state, state.round);
	if (!layout) return { ok: false, error: "No options for round" };

	const correct = move === layout.correctIdx;
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

export const EMOJI_CHARADES_ENGINE: GameEngine<EmojiCharadesState> = {
	createInitialState,
	applyMove,
	isMyTurn(state, userId) {
		if (state.phase === "finished") return false;
		const seat = seatOfPlayer(state, userId);
		if (!seat) return false;
		if (state.phase === "revealed") return true;
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
