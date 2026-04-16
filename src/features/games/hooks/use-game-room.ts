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

type RoomData = { user_a: string; user_b: string };

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

/** Start a new game with swapped roles and broadcast game_start. */
function startNewGame(
	room: RoomData,
	roomDataRef: React.MutableRefObject<RoomData | null>,
	setGameState: React.Dispatch<React.SetStateAction<TicTacToeState | null>>,
	setRoomStatus: React.Dispatch<React.SetStateAction<GameRoomStatus>>,
	setRematchRequested: React.Dispatch<React.SetStateAction<boolean>>,
	setOpponentWantsRematch: React.Dispatch<React.SetStateAction<boolean>>,
	channel: ReturnType<typeof supabase.channel>,
) {
	const swappedA = room.user_b;
	const swappedB = room.user_a;
	const state = createInitialState(swappedA, swappedB);

	roomDataRef.current = { user_a: swappedA, user_b: swappedB };
	setGameState(state);
	setRoomStatus("playing");
	setRematchRequested(false);
	setOpponentWantsRematch(false);

	channel.send({
		type: "broadcast",
		event: "game_start",
		payload: {
			player_a: swappedA,
			player_b: swappedB,
			game_type: "tic-tac-toe",
		} satisfies BroadcastGameStartPayload,
	});
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
	const roomDataRef = useRef<RoomData | null>(null);

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
			roomDataRef.current = { user_a: data.user_a, user_b: data.user_b };

			const channel = supabase.channel(`game:${roomId}`, {
				config: { broadcast: { self: false }, presence: { key: userId } },
			});
			channelRef.current = channel;

			channel.on("broadcast", { event: "game_start" }, (payload) => {
				const d = payload.payload as BroadcastGameStartPayload;
				roomDataRef.current = { user_a: d.player_a, user_b: d.player_b };
				setGameState(createInitialState(d.player_a, d.player_b));
				setRoomStatus("playing");
				setRematchRequested(false);
				setOpponentWantsRematch(false);
			});

			channel.on("broadcast", { event: "move" }, (payload) => {
				const d = payload.payload as BroadcastMovePayload;
				if (d.sender_id === userId) return;
				setGameState((prev) => {
					if (!prev) return prev;
					const result = applyMove(prev, d.position, d.sender_id);
					if (!result.ok) return prev;
					if (result.state.result !== "playing") setRoomStatus("finished");
					return result.state;
				});
			});

			channel.on("broadcast", { event: "rematch" }, (payload) => {
				const d = payload.payload as BroadcastRematchPayload;
				if (d.sender_id === userId) return;
				setOpponentWantsRematch(true);

				setRematchRequested((myRequest) => {
					if (myRequest && roomDataRef.current) {
						startNewGame(
							roomDataRef.current,
							roomDataRef,
							setGameState,
							setRoomStatus,
							setRematchRequested,
							setOpponentWantsRematch,
							channel,
						);
						return false;
					}
					return myRequest;
				});
			});

			channel.on("presence", { event: "sync" }, () => {
				const presenceState = channel.presenceState();
				if (Object.keys(presenceState).length < 2) return;

				setRoomStatus((prev) => {
					if (
						prev === "waiting_for_opponent" &&
						roomDataRef.current?.user_a === userId
					) {
						const room = roomDataRef.current;
						setGameState(createInitialState(room.user_a, room.user_b));
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
	}, [userId, roomId]);

	const makeMove = useCallback(
		(position: number) => {
			if (!gameState || !channelRef.current) return;
			const result = applyMove(gameState, position, userId);
			if (!result.ok) return;

			setGameState(result.state);
			if (result.state.result !== "playing") setRoomStatus("finished");

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
			payload: { sender_id: userId } satisfies BroadcastRematchPayload,
		});

		if (opponentWantsRematch && roomDataRef.current && channelRef.current) {
			startNewGame(
				roomDataRef.current,
				roomDataRef,
				setGameState,
				setRoomStatus,
				setRematchRequested,
				setOpponentWantsRematch,
				channelRef.current,
			);
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
