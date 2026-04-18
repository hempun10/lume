import type { GameEngine } from "../engines/types";
import type { RoomData } from "./use-game-room.types";

/**
 * Derive which seat starts a given round from the immutable original
 * room. Round 0 uses the original roles (user_a starts). Each
 * subsequent round swaps starting player.
 *
 * Because both clients share the same `originalRoom` and independently
 * bump `round` in lockstep, they always agree on the assignment.
 */
export function stateForRound<State>(
	engine: GameEngine<State>,
	originalRoom: RoomData,
	round: number,
): State {
	const first = round % 2 === 0 ? originalRoom.user_a : originalRoom.user_b;
	const second = round % 2 === 0 ? originalRoom.user_b : originalRoom.user_a;
	return engine.createInitialState(first, second);
}
