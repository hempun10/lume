import { useCallback, useEffect, useRef, useState } from "react";
import type { supabase } from "@/lib/supabase/client";

// --- Broadcast payload types ---

interface GameInvitePayload {
	sender_id: string;
	game_id: string;
	game_name: string;
}

interface GameAcceptPayload {
	sender_id: string;
	game_id: string;
}

interface GameRejectPayload {
	sender_id: string;
	game_id: string;
}

// --- Public types ---

export type GameInviteStatus =
	| "idle"
	| "inviting" // I sent an invite, waiting for response
	| "invited" // I received an invite
	| "accepted" // Both agreed, game starting
	| "rejected"; // My invite was rejected

export interface IncomingInvite {
	gameId: string;
	gameName: string;
	senderId: string;
}

interface UseGameInviteReturn {
	/** Current invitation status */
	status: GameInviteStatus;
	/** Details of an incoming invite (when status === "invited") */
	incomingInvite: IncomingInvite | null;
	/** The game ID that was accepted (when status === "accepted") */
	acceptedGameId: string | null;
	/** Send a game invite to the stranger */
	sendInvite: (gameId: string, gameName: string) => void;
	/** Accept an incoming invite */
	acceptInvite: () => void;
	/** Reject an incoming invite */
	rejectInvite: () => void;
	/** Whether game requests are banned */
	isBanned: boolean;
	/** Toggle ban on game requests */
	toggleBan: () => void;
	/** Reset invite state back to idle */
	reset: () => void;
}

/**
 * Game invitation hook that uses the existing chat Broadcast channel.
 *
 * Events: game_invite, game_accept, game_reject
 *
 * The channelRef must be from useRealtimeChat — we piggyback on the
 * same chat:{roomId} channel so no additional subscriptions are needed.
 */
export function useGameInvite(
	channelRef: React.RefObject<ReturnType<typeof supabase.channel> | null>,
	userId: string,
): UseGameInviteReturn {
	const [status, setStatus] = useState<GameInviteStatus>("idle");
	const [incomingInvite, setIncomingInvite] = useState<IncomingInvite | null>(
		null,
	);
	const [acceptedGameId, setAcceptedGameId] = useState<string | null>(null);
	const [isBanned, setIsBanned] = useState(false);

	// Track the game we invited for (to match accept/reject)
	const pendingGameIdRef = useRef<string | null>(null);

	// Auto-clear rejected status after 3s
	const rejectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		const channel = channelRef.current;
		if (!channel) return;

		// --- Incoming invite ---
		const onInvite = (payload: { payload: GameInvitePayload }) => {
			const data = payload.payload;
			if (data.sender_id === userId) return;

			if (isBanned) {
				// Auto-reject silently
				channel.send({
					type: "broadcast",
					event: "game_reject",
					payload: {
						sender_id: userId,
						game_id: data.game_id,
					} satisfies GameRejectPayload,
				});
				return;
			}

			setIncomingInvite({
				gameId: data.game_id,
				gameName: data.game_name,
				senderId: data.sender_id,
			});
			setStatus("invited");
		};

		// --- Invite accepted ---
		const onAccept = (payload: { payload: GameAcceptPayload }) => {
			const data = payload.payload;
			if (data.sender_id === userId) return;

			setAcceptedGameId(data.game_id);
			setStatus("accepted");
		};

		// --- Invite rejected ---
		const onReject = (payload: { payload: GameRejectPayload }) => {
			const data = payload.payload;
			if (data.sender_id === userId) return;

			setStatus("rejected");
			pendingGameIdRef.current = null;

			// Auto-clear after 3s
			rejectTimeoutRef.current = setTimeout(() => {
				setStatus((prev) => (prev === "rejected" ? "idle" : prev));
			}, 3000);
		};

		channel.on("broadcast", { event: "game_invite" }, onInvite);
		channel.on("broadcast", { event: "game_accept" }, onAccept);
		channel.on("broadcast", { event: "game_reject" }, onReject);

		return () => {
			if (rejectTimeoutRef.current) {
				clearTimeout(rejectTimeoutRef.current);
			}
			// Supabase JS doesn't support removing individual listeners,
			// but cleanup happens when channel is removed in useRealtimeChat.
		};
	}, [channelRef, userId, isBanned]);

	const sendInvite = useCallback(
		(gameId: string, gameName: string) => {
			const channel = channelRef.current;
			if (!channel || status !== "idle") return;

			pendingGameIdRef.current = gameId;
			setStatus("inviting");

			channel.send({
				type: "broadcast",
				event: "game_invite",
				payload: {
					sender_id: userId,
					game_id: gameId,
					game_name: gameName,
				} satisfies GameInvitePayload,
			});
		},
		[channelRef, userId, status],
	);

	const acceptInvite = useCallback(() => {
		const channel = channelRef.current;
		if (!channel || !incomingInvite) return;

		channel.send({
			type: "broadcast",
			event: "game_accept",
			payload: {
				sender_id: userId,
				game_id: incomingInvite.gameId,
			} satisfies GameAcceptPayload,
		});

		setAcceptedGameId(incomingInvite.gameId);
		setStatus("accepted");
		setIncomingInvite(null);
	}, [channelRef, userId, incomingInvite]);

	const rejectInvite = useCallback(() => {
		const channel = channelRef.current;
		if (!channel || !incomingInvite) return;

		channel.send({
			type: "broadcast",
			event: "game_reject",
			payload: {
				sender_id: userId,
				game_id: incomingInvite.gameId,
			} satisfies GameRejectPayload,
		});

		setIncomingInvite(null);
		setStatus("idle");
	}, [channelRef, userId, incomingInvite]);

	const toggleBan = useCallback(() => {
		setIsBanned((prev) => !prev);
	}, []);

	const reset = useCallback(() => {
		setStatus("idle");
		setIncomingInvite(null);
		setAcceptedGameId(null);
		pendingGameIdRef.current = null;
	}, []);

	return {
		status,
		incomingInvite,
		acceptedGameId,
		sendInvite,
		acceptInvite,
		rejectInvite,
		isBanned,
		toggleBan,
		reset,
	};
}
