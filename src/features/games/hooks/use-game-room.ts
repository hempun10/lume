import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { useAuth } from "@/features/auth";
import { supabase } from "@/lib/supabase/client";
import type { GameEngine, GameResult, Seat } from "../engines/types";

interface BroadcastMovePayload {
	sender_id: string;
	move: number;
	timestamp: string;
}

interface BroadcastGameStartPayload {
	player_a: string;
	player_b: string;
	game_type: string;
}

interface BroadcastRematchPayload {
	sender_id: string;
}

type RoomData = { user_a: string; user_b: string };

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

/**
 * Derive which seat starts a given round from the immutable original
 * room. Round 0 uses the original roles (user_a starts). Each
 * subsequent round swaps starting player.
 *
 * Because both clients share the same `originalRoom` and independently
 * bump `round` in lockstep, they always agree on the assignment.
 */
function stateForRound<State>(
	engine: GameEngine<State>,
	originalRoom: RoomData,
	round: number,
): State {
	const first = round % 2 === 0 ? originalRoom.user_a : originalRoom.user_b;
	const second = round % 2 === 0 ? originalRoom.user_b : originalRoom.user_a;
	return engine.createInitialState(first, second);
}

/**
 * Generic game room hook — works for any turn-based game whose engine
 * conforms to `GameEngine<State>`. Handles:
 *  - Room fetch + Broadcast channel setup
 *  - Presence-based game_start handshake (user_a broadcasts first)
 *  - Move broadcast + engine-based validation
 *  - Deterministic round counter for rematches
 */
export function useGameRoom<State>(
	roomId: string,
	engine: GameEngine<State>,
	gameType: string,
	options?: UseGameRoomOptions,
): UseGameRoomReturn<State> {
	const { user } = useAuth();
	const userId = user?.id ?? "";

	const [gameState, setGameState] = useState<State | null>(null);
	const [roomStatus, setRoomStatus] = useState<GameRoomStatus>("connecting");
	const [rematchRequested, setRematchRequested] = useState(false);
	const [opponentWantsRematch, setOpponentWantsRematch] = useState(false);

	const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
	const engineRef = useRef(engine);
	engineRef.current = engine;

	// Hold the caller's latest customEvents map in a ref so the channel
	// listener always dispatches to the current handlers without
	// re-subscribing on every render.
	const customEventsRef = useRef<
		Record<string, CustomEventHandler> | undefined
	>(options?.customEvents);
	customEventsRef.current = options?.customEvents;

	const originalRoomRef = useRef<RoomData | null>(null);
	const roundRef = useRef(0);
	const rematchRequestedRef = useRef(false);
	const opponentWantsRematchRef = useRef(false);

	const startNextRound = useCallback(() => {
		if (!originalRoomRef.current) return;
		roundRef.current += 1;
		rematchRequestedRef.current = false;
		opponentWantsRematchRef.current = false;
		setGameState(
			stateForRound(
				engineRef.current,
				originalRoomRef.current,
				roundRef.current,
			),
		);
		setRoomStatus("playing");
		setRematchRequested(false);
		setOpponentWantsRematch(false);
	}, []);

	const maybeStartNextRound = useCallback(() => {
		if (rematchRequestedRef.current && opponentWantsRematchRef.current) {
			startNextRound();
		}
	}, [startNextRound]);

	useEffect(() => {
		if (!userId || !roomId) return;
		let cancelled = false;

		async function setup() {
			const { data } = await supabase
				.from("rooms")
				.select("user_a, user_b")
				.eq("id", roomId)
				.single();

			if (cancelled || !data) return;
			originalRoomRef.current = { user_a: data.user_a, user_b: data.user_b };
			roundRef.current = 0;

			const channel = supabase.channel(`game:${roomId}`, {
				config: { broadcast: { self: false }, presence: { key: userId } },
			});
			channelRef.current = channel;

			channel.on("broadcast", { event: "game_start" }, (payload) => {
				const d = payload.payload as BroadcastGameStartPayload;
				originalRoomRef.current = {
					user_a: d.player_a,
					user_b: d.player_b,
				};
				roundRef.current = 0;
				rematchRequestedRef.current = false;
				opponentWantsRematchRef.current = false;
				setGameState(
					engineRef.current.createInitialState(d.player_a, d.player_b),
				);
				setRoomStatus("playing");
				setRematchRequested(false);
				setOpponentWantsRematch(false);
			});

			channel.on("broadcast", { event: "move" }, (payload) => {
				const d = payload.payload as BroadcastMovePayload;
				if (d.sender_id === userId) return;
				setGameState((prev) => {
					if (!prev) return prev;
					const result = engineRef.current.applyMove(prev, d.move, d.sender_id);
					if (!result.ok) return prev;
					if (engineRef.current.isFinished(result.state)) {
						setRoomStatus("finished");
					}
					return result.state;
				});
			});

			channel.on("broadcast", { event: "rematch" }, (payload) => {
				const d = payload.payload as BroadcastRematchPayload;
				if (d.sender_id === userId) return;
				opponentWantsRematchRef.current = true;
				setOpponentWantsRematch(true);
				maybeStartNextRound();
			});

			// Single listener multiplexes all game-specific side-channel
			// events by name. Game boards register handlers via
			// `options.customEvents`; payload shape is up to each game.
			channel.on("broadcast", { event: "custom_event" }, (payload) => {
				const d = payload.payload as {
					sender_id: string;
					event: string;
					data: unknown;
				};
				console.log("[D&G][recv]", {
					event: d?.event,
					from: d?.sender_id,
					me: userId,
					self: d?.sender_id === userId,
					hasHandler: !!customEventsRef.current?.[d?.event],
					registeredKeys: Object.keys(customEventsRef.current ?? {}),
				});
				if (!d || d.sender_id === userId) return;
				const handler = customEventsRef.current?.[d.event];
				if (handler) handler(d.data, d.sender_id);
			});

			channel.on("presence", { event: "sync" }, () => {
				const presenceState = channel.presenceState();
				if (Object.keys(presenceState).length < 2) return;

				setRoomStatus((prev) => {
					if (
						prev === "waiting_for_opponent" &&
						originalRoomRef.current?.user_a === userId
					) {
						const room = originalRoomRef.current;
						roundRef.current = 0;
						setGameState(
							engineRef.current.createInitialState(room.user_a, room.user_b),
						);
						channel.send({
							type: "broadcast",
							event: "game_start",
							payload: {
								player_a: room.user_a,
								player_b: room.user_b,
								game_type: gameType,
							} satisfies BroadcastGameStartPayload,
						});
						return "playing";
					}
					return prev;
				});
			});

			channel.subscribe(async (status) => {
				if (status === "SUBSCRIBED") {
					await channel.track({ user_id: userId, joined_at: Date.now() });
					setRoomStatus("waiting_for_opponent");
				}
			});
		}

		setup();

		return () => {
			cancelled = true;
			if (channelRef.current) {
				supabase.removeChannel(channelRef.current);
				channelRef.current = null;
			}
		};
	}, [userId, roomId, gameType, maybeStartNextRound]);

	const makeMove = useCallback(
		(move: number) => {
			if (!gameState || !channelRef.current) return;
			const result = engineRef.current.applyMove(gameState, move, userId);
			if (!result.ok) return;

			setGameState(result.state);
			if (engineRef.current.isFinished(result.state)) {
				setRoomStatus("finished");
			}

			channelRef.current.send({
				type: "broadcast",
				event: "move",
				payload: {
					sender_id: userId,
					move,
					timestamp: new Date().toISOString(),
				} satisfies BroadcastMovePayload,
			});
		},
		[gameState, userId],
	);

	const requestRematch = useCallback(() => {
		if (!channelRef.current) return;
		rematchRequestedRef.current = true;
		setRematchRequested(true);

		channelRef.current.send({
			type: "broadcast",
			event: "rematch",
			payload: { sender_id: userId } satisfies BroadcastRematchPayload,
		});

		maybeStartNextRound();
	}, [userId, maybeStartNextRound]);

	const sendCustomEvent = useCallback(
		(event: string, payload: unknown) => {
			if (!channelRef.current) {
				console.log("[D&G][send] NO CHANNEL", event);
				return;
			}
			console.log("[D&G][send]", event, payload);
			channelRef.current.send({
				type: "broadcast",
				event: "custom_event",
				payload: { sender_id: userId, event, data: payload },
			});
		},
		[userId],
	);

	const myTurn = gameState ? engine.isMyTurn(gameState, userId) : false;
	const mySeat: Seat = gameState ? engine.seatOf(gameState, userId) : null;
	const outcome: GameResult = gameState
		? engine.resultFor(gameState, userId)
		: "playing";

	return {
		gameState,
		roomStatus,
		myTurn,
		mySeat,
		outcome,
		makeMove,
		requestRematch,
		rematchRequested,
		opponentWantsRematch,
		sendCustomEvent,
		setGameState,
	};
}
