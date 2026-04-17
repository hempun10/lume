/**
 * Two Truths and a Lie engine — user-authored variant.
 *
 * Pure state + move contract. Non-numeric data (the reader's three
 * written statements, the revealed lie index) arrives via
 * `useGameRoom`'s `customEvents` side-channel and is applied by the
 * board via `setGameState` using the helpers exported here.
 *
 * Flow per round:
 *   1. `composing` — the reader types three statements and picks
 *      which one is the lie. The lie index stays in the reader's
 *      local React state; it is never in shared game state during
 *      composition. The other seat just waits.
 *   2. Reader submits: board broadcasts a `statements` custom event
 *      `{statements: [s, s, s]}` and calls `setGameState` on itself
 *      with `applyStatements`. Both sides now see phase `guessing`.
 *   3. `guessing` — guesser picks 0 / 1 / 2 as a numeric `move`.
 *      Engine records `guess` but does not score (lieIdx unknown).
 *   4. Reader observes `guess !== null`, broadcasts a `reveal` custom
 *      event `{lieIdx}` and applies `applyReveal` locally. Both sides
 *      transition to `revealed`; the guess is scored on that
 *      transition.
 *   5. `revealed` — either player sends advance (move = 4) to go to
 *      the next round or finish.
 *
 * Roles alternate: seat A reads even rounds (0, 2), seat B reads odd
 * rounds (1, 3). Four rounds total means two per person.
 */

import type {
	GameResult as EngineGameResult,
	GameEngine,
	MoveResult,
	Seat,
} from "./types";

export const TWO_TRUTHS_TOTAL_ROUNDS = 4;
export const TWO_TRUTHS_MOVE_ADVANCE = 4;
export const TWO_TRUTHS_STATEMENT_MAX = 140;

export type TwoTruthsPick = 0 | 1 | 2;
export type TwoTruthsPhase = "composing" | "guessing" | "revealed" | "finished";

export interface TwoTruthsHistoryEntry {
	readerSeat: "A" | "B";
	statements: readonly [string, string, string];
	guess: TwoTruthsPick;
	correct: TwoTruthsPick;
}

export interface TwoTruthsState {
	playerA: string;
	playerB: string;
	round: number;
	totalRounds: number;
	/** The reader's three statements for the current round. */
	statements: readonly [string, string, string] | null;
	/** Guesser's pick for the current round. */
	guess: TwoTruthsPick | null;
	/**
	 * The true lie index for the current round, only populated once
	 * the reveal event is applied. Before that, only the reader knows
	 * it (they keep it in board-local state).
	 */
	lieIdx: TwoTruthsPick | null;
	aScore: number;
	bScore: number;
	history: TwoTruthsHistoryEntry[];
	phase: TwoTruthsPhase;
}

export function createInitialState(
	playerA: string,
	playerB: string,
): TwoTruthsState {
	return {
		playerA,
		playerB,
		round: 0,
		totalRounds: TWO_TRUTHS_TOTAL_ROUNDS,
		statements: null,
		guess: null,
		lieIdx: null,
		aScore: 0,
		bScore: 0,
		history: [],
		phase: "composing",
	};
}

/** Which seat is the reader this round. A on even, B on odd. */
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

/**
 * Called on BOTH seats — reader after it submits its compose form,
 * guesser inside the `statements` custom-event handler. Transitions
 * `composing → guessing` with the reader's three statements in shared
 * state.
 */
export function applyStatements(
	state: TwoTruthsState,
	statements: readonly [string, string, string],
): TwoTruthsState {
	if (state.phase !== "composing") return state;
	return {
		...state,
		statements,
		phase: "guessing",
	};
}

/**
 * Called on BOTH seats — reader after it broadcasts reveal, guesser
 * inside the `reveal` custom-event handler. Transitions
 * `guessing → revealed` and applies scoring based on the guess.
 */
export function applyReveal(
	state: TwoTruthsState,
	lieIdx: TwoTruthsPick,
): TwoTruthsState {
	if (state.phase !== "guessing") return state;
	if (state.guess === null || state.statements === null) return state;

	const guesserSeat = guesserSeatFor(state);
	const correct = state.guess === lieIdx;
	const nextAScore = state.aScore + (correct && guesserSeat === "A" ? 1 : 0);
	const nextBScore = state.bScore + (correct && guesserSeat === "B" ? 1 : 0);

	return {
		...state,
		lieIdx,
		aScore: nextAScore,
		bScore: nextBScore,
		phase: "revealed",
	};
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
			return { ok: false, error: "Can't advance yet" };
		}
		if (
			state.statements === null ||
			state.guess === null ||
			state.lieIdx === null
		) {
			return { ok: false, error: "Round not fully resolved" };
		}

		const nextHistory: TwoTruthsHistoryEntry[] = [
			...state.history,
			{
				readerSeat: readerSeatFor(state),
				statements: state.statements,
				guess: state.guess,
				correct: state.lieIdx,
			},
		];
		const isLast = state.round + 1 >= state.totalRounds;
		return {
			ok: true,
			state: {
				...state,
				round: isLast ? state.round : state.round + 1,
				statements: null,
				guess: null,
				lieIdx: null,
				history: nextHistory,
				phase: isLast ? "finished" : "composing",
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

	return {
		ok: true,
		state: {
			...state,
			guess: move,
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

		if (state.phase === "composing") {
			return seat === readerSeatFor(state);
		}
		if (state.phase === "guessing") {
			// Guesser picks until they lock in. After their pick, it's
			// on the reader to reveal — but reveal goes via custom
			// event, not a numeric move, so we still report the reader
			// as "on turn" to drive UI affordance.
			if (state.guess === null) return seat === guesserSeatFor(state);
			return seat === readerSeatFor(state);
		}
		// revealed: either player can advance.
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
