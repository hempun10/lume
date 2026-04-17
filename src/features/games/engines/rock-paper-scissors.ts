/**
 * Rock Paper Scissors game engine — best of 5.
 *
 * Moves:
 *   0 = Rock
 *   1 = Paper
 *   2 = Scissors
 *   3 = Advance to next round (valid only in `revealed` phase)
 *
 * Per-round lifecycle: `picking → revealed → picking` until one seat
 * hits `WIN_THRESHOLD` wins, at which point the phase flips to
 * `finished`. Ties don't advance the score — they still reveal, then
 * advance to a replay round on the next prompt.
 *
 * Fairness note: this is not cryptographic commit-reveal. Both clients
 * broadcast their pick the moment it's made, so a user with devtools
 * could theoretically snoop the channel and pick a counter. We treat
 * that as out of scope for a casual stranger-chat game. What we *do*
 * enforce at the UI layer: you don't see your opponent's pick until
 * you've committed your own — because the engine stores both picks
 * but the board only reveals them once both are in.
 */

import type {
	GameResult as EngineGameResult,
	GameEngine,
	MoveResult,
	Seat,
} from "./types";

export const RPS_WIN_THRESHOLD = 3;
export const RPS_MOVE_ROCK = 0;
export const RPS_MOVE_PAPER = 1;
export const RPS_MOVE_SCISSORS = 2;
export const RPS_MOVE_ADVANCE = 3;

export type RPSPick = 0 | 1 | 2;
export type RPSPhase = "picking" | "revealed" | "finished";
export type RPSOutcome = "a" | "b" | "tie";

export interface RPSHistoryEntry {
	aPick: RPSPick;
	bPick: RPSPick;
	outcome: RPSOutcome;
}

export interface RockPaperScissorsState {
	playerA: string;
	playerB: string;
	round: number;
	winThreshold: number;
	aPick: RPSPick | null;
	bPick: RPSPick | null;
	aWins: number;
	bWins: number;
	history: RPSHistoryEntry[];
	phase: RPSPhase;
}

/**
 * Classic RPS outcome table: rock beats scissors, paper beats rock,
 * scissors beat paper. Returns who won from the given picks.
 */
export function roundOutcome(a: RPSPick, b: RPSPick): RPSOutcome {
	if (a === b) return "tie";
	if (
		(a === RPS_MOVE_ROCK && b === RPS_MOVE_SCISSORS) ||
		(a === RPS_MOVE_PAPER && b === RPS_MOVE_ROCK) ||
		(a === RPS_MOVE_SCISSORS && b === RPS_MOVE_PAPER)
	) {
		return "a";
	}
	return "b";
}

export function pickLabel(pick: RPSPick): string {
	switch (pick) {
		case RPS_MOVE_ROCK:
			return "Rock";
		case RPS_MOVE_PAPER:
			return "Paper";
		case RPS_MOVE_SCISSORS:
			return "Scissors";
	}
}

export function pickEmoji(pick: RPSPick): string {
	switch (pick) {
		case RPS_MOVE_ROCK:
			return "🪨";
		case RPS_MOVE_PAPER:
			return "📄";
		case RPS_MOVE_SCISSORS:
			return "✂️";
	}
}

export function createInitialState(
	playerA: string,
	playerB: string,
): RockPaperScissorsState {
	return {
		playerA,
		playerB,
		round: 0,
		winThreshold: RPS_WIN_THRESHOLD,
		aPick: null,
		bPick: null,
		aWins: 0,
		bWins: 0,
		history: [],
		phase: "picking",
	};
}

function seatOfPlayer(state: RockPaperScissorsState, playerId: string): Seat {
	if (playerId === state.playerA) return "A";
	if (playerId === state.playerB) return "B";
	return null;
}

function isPick(move: number): move is RPSPick {
	return move === 0 || move === 1 || move === 2;
}

export function applyMove(
	state: RockPaperScissorsState,
	move: number,
	playerId: string,
): MoveResult<RockPaperScissorsState> {
	if (state.phase === "finished") {
		return { ok: false, error: "Game already finished" };
	}

	const seat = seatOfPlayer(state, playerId);
	if (!seat) return { ok: false, error: "Not a participant" };

	if (move === RPS_MOVE_ADVANCE) {
		if (state.phase !== "revealed") {
			return { ok: false, error: "Can't advance while picking" };
		}
		if (state.aPick === null || state.bPick === null) {
			return { ok: false, error: "Picks missing" };
		}
		const outcome = roundOutcome(state.aPick, state.bPick);
		const nextHistory: RPSHistoryEntry[] = [
			...state.history,
			{ aPick: state.aPick, bPick: state.bPick, outcome },
		];
		const nextAWins = state.aWins + (outcome === "a" ? 1 : 0);
		const nextBWins = state.bWins + (outcome === "b" ? 1 : 0);
		const gameOver =
			nextAWins >= state.winThreshold || nextBWins >= state.winThreshold;

		return {
			ok: true,
			state: {
				...state,
				round: state.round + 1,
				aPick: null,
				bPick: null,
				aWins: nextAWins,
				bWins: nextBWins,
				history: nextHistory,
				phase: gameOver ? "finished" : "picking",
			},
		};
	}

	if (!isPick(move)) {
		return { ok: false, error: "Invalid move" };
	}

	if (state.phase !== "picking") {
		return { ok: false, error: "Not in picking phase" };
	}

	if (seat === "A") {
		if (state.aPick !== null) return { ok: false, error: "Already picked" };
		const nextPhase: RPSPhase = state.bPick !== null ? "revealed" : "picking";
		return {
			ok: true,
			state: { ...state, aPick: move, phase: nextPhase },
		};
	}
	if (state.bPick !== null) return { ok: false, error: "Already picked" };
	const nextPhase: RPSPhase = state.aPick !== null ? "revealed" : "picking";
	return {
		ok: true,
		state: { ...state, bPick: move, phase: nextPhase },
	};
}

export const ROCK_PAPER_SCISSORS_ENGINE: GameEngine<RockPaperScissorsState> = {
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
		if (!seat) return "draw";
		if (state.aWins === state.bWins) return "draw";
		const userWon =
			(seat === "A" && state.aWins > state.bWins) ||
			(seat === "B" && state.bWins > state.aWins);
		return userWon ? "won" : "lost";
	},
	seatOf(state, userId) {
		return seatOfPlayer(state, userId);
	},
};
