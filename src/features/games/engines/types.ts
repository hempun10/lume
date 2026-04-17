/**
 * Shared contract every turn-based game engine must satisfy so that
 * `useGameRoom` can stay game-agnostic.
 *
 * State is opaque to the hook — only the engine's own board UI
 * decodes it. The hook only cares about:
 *  - creating initial state
 *  - applying a numeric move (column / cell index) and getting a new
 *    state back or an error
 *  - whether it is the current user's turn
 *  - whether the round is over, and if so, what the result is for
 *    the current user
 */

export type MoveResult<State> =
	| { ok: true; state: State }
	| { ok: false; error: string };

export type GameResult = "playing" | "won" | "lost" | "draw";

export type Seat = "A" | "B" | null;

/**
 * Move type is an integer for every game we ship today (cell index for
 * TicTacToe, column index for Connect Four). Kept as a generic so we
 * can widen later (e.g. a tuple for chess) without refactoring the hook.
 */
export interface GameEngine<State, Move = number> {
	createInitialState(playerA: string, playerB: string): State;
	applyMove(state: State, move: Move, playerId: string): MoveResult<State>;
	isMyTurn(state: State, userId: string): boolean;
	/** Has the round ended (won/lost/draw) from this user's perspective. */
	isFinished(state: State): boolean;
	/** Result from this user's perspective. */
	resultFor(state: State, userId: string): GameResult;
	/** A or B (or null if the user is not a participant). */
	seatOf(state: State, userId: string): Seat;
}
