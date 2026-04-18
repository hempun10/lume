import type { Dispatch, SetStateAction } from "react";
import type { GameResult, Seat } from "../engines/types";

export interface BroadcastMovePayload {
	sender_id: string;
	move: number;
	timestamp: string;
}

export interface BroadcastGameStartPayload {
	player_a: string;
	player_b: string;
	game_type: string;
}

export interface BroadcastRematchPayload {
	sender_id: string;
}

export interface BroadcastCustomEventPayload {
	sender_id: string;
	event: string;
	data: unknown;
}

export type RoomData = { user_a: string; user_b: string };

export type GameRoomStatus =
	| "connecting"
	| "waiting_for_opponent"
	| "playing"
	| "finished";

/**
 * Listener for a game-specific side-channel event on the shared
 * `game:${roomId}` broadcast channel. Games that need to transmit
 * state that doesn't fit the generic `number` move contract (e.g.
 * drawing strokes, user-authored text, out-of-band reveals) can
 * register a map of these.
 *
 * Self-sent events are filtered out upstream — handlers only fire
 * for events from the other seat.
 */
// biome-ignore lint/suspicious/noExplicitAny: event payloads are game-specific.
export type CustomEventHandler = (payload: any, senderId: string) => void;

export interface UseGameRoomOptions {
	customEvents?: Record<string, CustomEventHandler>;
}

export interface UseGameRoomReturn<State> {
	gameState: State | null;
	roomStatus: GameRoomStatus;
	myTurn: boolean;
	mySeat: Seat;
	outcome: GameResult;
	makeMove: (move: number) => void;
	requestRematch: () => void;
	rematchRequested: boolean;
	opponentWantsRematch: boolean;
	/**
	 * Broadcast a game-specific side-channel event to the other seat.
	 * Use for data that doesn't fit the generic move contract. The
	 * sender does not receive their own event (channel is configured
	 * with `self: false`).
	 */
	sendCustomEvent: (event: string, payload: unknown) => void;
	/**
	 * Direct setter for the shared game state. Boards use this inside
	 * custom-event handlers (registered via `options.customEvents`) to
	 * apply transitions that don't fit the numeric move contract —
	 * e.g. receiving user-authored statements, or a reveal event that
	 * exposes a value the sender kept private.
	 */
	setGameState: Dispatch<SetStateAction<State | null>>;
}
