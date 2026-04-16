import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/features/auth";
import { supabase } from "@/lib/supabase/client";
import {
	applyMove,
	createInitialState,
	getMyMark,
	isMyTurn,
	type TicTacToeState,
} from "../engines/tic-tac-toe";

interface BroadcastMovePayload {
	sender_id: string;
	position: number;
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

export type GameRoomStatus =
	| "connecting"
	| "waiting_for_opponent"
	| "playing"
	| "finished";

interface UseGameRoomReturn {
	gameState: TicTacToeState | null;
	roomStatus: GameRoomStatus;
	myTurn: boolean;
	myMark: "X" | "O" | null;
	makeMove: (position: number) => void;
	requestRematch: () => void;
	rematchRequested: boolean;
	opponentWantsRematch: boolean;
}

/**
 * Game room hook using Supabase Broadcast.
 *
 * - Both players join game:{roomId} channel
 * - user_a (room creator) broadcasts game_start with player assignments
 * - Moves are broadcast and validated client-side
 * - Game state is local (no DB writes for moves)
 */
export function useGameRoom(roomId: string): UseGameRoomReturn {
	const { user } = useAuth();
	const userId = user?.id ?? "";

	const [gameState, setGameState] = useState<TicTacToeState | null>(null);
	const [roomStatus, setRoomStatus] = useState<GameRoomStatus>("connecting");
	const [rematchRequested, setRematchRequested] = useState(false);
	const [opponentWantsRematch, setOpponentWantsRematch] = useState(false);

	const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
	const roomDataRef = useRef<{ user_a: string; user_b: string } | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: channel setup runs once
	useEffect(() => {
		if (!userId || !roomId) return;
		let cancelled = false;

		async function setup() {
			// Fetch room data FIRST so we know who is user_a (X) and user_b (O)
			const { data } = await supabase
				.from("rooms")
				.select("user_a, user_b")
				.eq("id", roomId)
				.single();

			if (cancelled || !data) return;
			roomDataRef.current = {
				user_a: data.user_a,
				user_b: data.user_b,
			};

			const channel = supabase.channel(`game:${roomId}`, {
				config: { broadcast: { self: false }, presence: { key: userId } },
			});
			channelRef.current = channel;

			// --- Broadcast: game_start ---
			channel.on("broadcast", { event: "game_start" }, (payload) => {
				const data = payload.payload as BroadcastGameStartPayload;
				const state = createInitialState(data.player_a, data.player_b);
				// Keep roomDataRef in sync so future rematches swap correctly
				roomDataRef.current = {
					user_a: data.player_a,
					user_b: data.player_b,
				};
				setGameState(state);
				setRoomStatus("playing");
				setRematchRequested(false);
				setOpponentWantsRematch(false);
			});

			// --- Broadcast: move ---
			channel.on("broadcast", { event: "move" }, (payload) => {
				const data = payload.payload as BroadcastMovePayload;
				if (data.sender_id === userId) return;

				setGameState((prev) => {
					if (!prev) return prev;
					const result = applyMove(prev, data.position, data.sender_id);
					if (result.ok) {
						if (result.state.result !== "playing") {
							setRoomStatus("finished");
						}
						return result.state;
					}
					return prev;
				});
			});

			// --- Broadcast: rematch ---
			channel.on("broadcast", { event: "rematch" }, (payload) => {
				const data = payload.payload as BroadcastRematchPayload;
				if (data.sender_id === userId) return;
				setOpponentWantsRematch(true);

				// If we also requested rematch, start new game
				setRematchRequested((myRequest) => {
					if (myRequest) {
						// Both want rematch — start new game with swapped roles
						const room = roomDataRef.current;
						if (room) {
							const state = createInitialState(room.user_b, room.user_a);
							// Swap for next game
							roomDataRef.current = {
								user_a: room.user_b,
								user_b: room.user_a,
							};
							setGameState(state);
							setRoomStatus("playing");
							setOpponentWantsRematch(false);
							// Broadcast new game start
							channel.send({
								type: "broadcast",
								event: "game_start",
								payload: {
									player_a: room.user_b,
									player_b: room.user_a,
									game_type: "tic-tac-toe",
								} satisfies BroadcastGameStartPayload,
							});
						}
						return false;
					}
					return myRequest;
				});
			});

			// --- Presence ---
			channel.on("presence", { event: "sync" }, () => {
				const state = channel.presenceState();
				const playerCount = Object.keys(state).length;

				if (playerCount >= 2) {
					// Both players present — user_a initiates the game
					setRoomStatus((prev) => {
						if (
							prev === "waiting_for_opponent" &&
							roomDataRef.current?.user_a === userId
						) {
							const room = roomDataRef.current;
							const gameStartState = createInitialState(
								room.user_a,
								room.user_b,
							);
							setGameState(gameStartState);

							// Broadcast game start to other player
							channel.send({
								type: "broadcast",
								event: "game_start",
								payload: {
									player_a: room.user_a,
									player_b: room.user_b,
									game_type: "tic-tac-toe",
								} satisfies BroadcastGameStartPayload,
							});

							return "playing";
						}
						return prev;
					});
				}
			});

			// Subscribe and track
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
	}, [userId, roomId]);

	const makeMove = useCallback(
		(position: number) => {
			if (!gameState || !channelRef.current) return;

			const result = applyMove(gameState, position, userId);
			if (!result.ok) return;

			setGameState(result.state);
			if (result.state.result !== "playing") {
				setRoomStatus("finished");
			}

			channelRef.current.send({
				type: "broadcast",
				event: "move",
				payload: {
					sender_id: userId,
					position,
					timestamp: new Date().toISOString(),
				} satisfies BroadcastMovePayload,
			});
		},
		[gameState, userId],
	);

	const requestRematch = useCallback(() => {
		if (!channelRef.current) return;
		setRematchRequested(true);

		channelRef.current.send({
			type: "broadcast",
			event: "rematch",
			payload: {
				sender_id: userId,
			} satisfies BroadcastRematchPayload,
		});

		// If opponent already requested, start new game
		if (opponentWantsRematch) {
			const room = roomDataRef.current;
			if (room) {
				const state = createInitialState(room.user_b, room.user_a);
				roomDataRef.current = {
					user_a: room.user_b,
					user_b: room.user_a,
				};
				setGameState(state);
				setRoomStatus("playing");
				setRematchRequested(false);
				setOpponentWantsRematch(false);

				channelRef.current.send({
					type: "broadcast",
					event: "game_start",
					payload: {
						player_a: room.user_b,
						player_b: room.user_a,
						game_type: "tic-tac-toe",
					} satisfies BroadcastGameStartPayload,
				});
			}
		}
	}, [userId, opponentWantsRematch]);

	const myTurn = gameState ? isMyTurn(gameState, userId) : false;
	const myMark = gameState ? getMyMark(gameState, userId) : null;

	return {
		gameState,
		roomStatus,
		myTurn,
		myMark,
		makeMove,
		requestRematch,
		rematchRequested,
		opponentWantsRematch,
	};
}
