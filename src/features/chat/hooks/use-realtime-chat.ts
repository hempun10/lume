import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/features/auth";
import { supabase } from "@/lib/supabase/client";
import type { ChatMessage, ChatSession } from "../types";

interface UseRealtimeChatReturn {
	session: ChatSession;
	sendMessage: (text: string) => void;
	endChat: () => void;
	broadcastTyping: () => void;
	toggleReaction: (messageId: string, emoji: string) => void;
	isStrangerTyping: boolean;
	isStrangerConnected: boolean;
	channelRef: React.RefObject<ReturnType<typeof supabase.channel> | null>;
}

interface BroadcastMessagePayload {
	sender_id: string;
	text: string;
	timestamp: string;
	id: string;
}

interface BroadcastTypingPayload {
	sender_id: string;
	is_typing: boolean;
}

interface BroadcastEndPayload {
	sender_id: string;
}

interface BroadcastReactionPayload {
	sender_id: string;
	message_id: string;
	emoji: string;
	action: "add" | "remove";
}

type SessionUpdater = React.Dispatch<React.SetStateAction<ChatSession>>;

// ---------------------------------------------------------------------------
// Channel event handlers (extracted from the setup useEffect for clarity)
// ---------------------------------------------------------------------------

function handleIncomingMessage(
	payload: { payload: unknown },
	userId: string,
	setSession: SessionUpdater,
	setIsStrangerTyping: (v: boolean) => void,
) {
	const data = payload.payload as BroadcastMessagePayload;
	if (data.sender_id === userId) return;

	const msg: ChatMessage = {
		id: data.id,
		senderId: data.sender_id,
		text: data.text,
		timestamp: new Date(data.timestamp),
	};
	setSession((prev) => ({
		...prev,
		messages: [...prev.messages, msg],
	}));
	setIsStrangerTyping(false);
}

function handleIncomingTyping(
	payload: { payload: unknown },
	userId: string,
	setIsStrangerTyping: (v: boolean) => void,
	typingTimeoutRef: React.MutableRefObject<ReturnType<
		typeof setTimeout
	> | null>,
) {
	const data = payload.payload as BroadcastTypingPayload;
	if (data.sender_id === userId) return;
	setIsStrangerTyping(data.is_typing);

	if (typingTimeoutRef.current) {
		clearTimeout(typingTimeoutRef.current);
	}
	if (data.is_typing) {
		typingTimeoutRef.current = setTimeout(() => {
			setIsStrangerTyping(false);
		}, 3000);
	}
}

function handleIncomingEnd(
	payload: { payload: unknown },
	userId: string,
	setSession: SessionUpdater,
	setIsStrangerTyping: (v: boolean) => void,
) {
	const data = payload.payload as BroadcastEndPayload;
	if (data.sender_id === userId) return;

	setIsStrangerTyping(false);
	setSession((prev) => ({
		...prev,
		status: "ended",
		endedAt: new Date(),
	}));
}

/**
 * Pure reducer that toggles a reaction on a specific message within the
 * message list. Always returns a fresh messages array (and fresh reaction
 * map for the touched message) so React sees the update.
 */
function applyReactionUpdate(
	messages: ChatMessage[],
	messageId: string,
	emoji: string,
	userId: string,
	action: "add" | "remove",
): ChatMessage[] {
	let changed = false;
	const next = messages.map((msg) => {
		if (msg.id !== messageId) return msg;

		const current = msg.reactions ?? {};
		const currentUsers = current[emoji] ?? [];

		if (action === "add") {
			if (currentUsers.includes(userId)) return msg;
			changed = true;
			return {
				...msg,
				reactions: { ...current, [emoji]: [...currentUsers, userId] },
			};
		}

		// remove
		if (!currentUsers.includes(userId)) return msg;
		changed = true;
		const nextUsers = currentUsers.filter((id) => id !== userId);
		const { [emoji]: _removed, ...rest } = current;
		return {
			...msg,
			reactions: nextUsers.length > 0 ? { ...rest, [emoji]: nextUsers } : rest,
		};
	});
	return changed ? next : messages;
}

function handleIncomingReaction(
	payload: { payload: unknown },
	userId: string,
	setSession: SessionUpdater,
) {
	const data = payload.payload as BroadcastReactionPayload;
	if (data.sender_id === userId) return;

	setSession((prev) => ({
		...prev,
		messages: applyReactionUpdate(
			prev.messages,
			data.message_id,
			data.emoji,
			data.sender_id,
			data.action,
		),
	}));
}

function handlePresenceSync(
	channel: ReturnType<typeof supabase.channel>,
	userId: string,
	setIsStrangerConnected: (v: boolean) => void,
) {
	const state = channel.presenceState();
	const otherPresent = Object.keys(state).some((key) => key !== userId);
	setIsStrangerConnected(otherPresent);
}

function handlePresenceLeave(
	leftPresences: Array<Record<string, unknown>>,
	userId: string,
	setIsStrangerConnected: (v: boolean) => void,
	setSession: SessionUpdater,
) {
	const strangerLeft = leftPresences.some(
		(p) => (p as { user_id?: string }).user_id !== userId,
	);
	if (strangerLeft) {
		setIsStrangerConnected(false);
		setSession((prev) => {
			if (prev.status === "active") {
				return { ...prev, status: "disconnected", endedAt: new Date() };
			}
			return prev;
		});
	}
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Real-time chat hook using Supabase Broadcast + Presence.
 *
 * - Messages are ephemeral (Broadcast only, no DB writes)
 * - Typing indicators via Broadcast
 * - Presence tracking for stranger connected/disconnected
 * - Room status updated to 'ended' on chat end
 */
export function useRealtimeChat(roomId: string): UseRealtimeChatReturn {
	const { user } = useAuth();
	const userId = user?.id ?? "";

	const [session, setSession] = useState<ChatSession>({
		status: "connecting",
		messages: [],
		startedAt: new Date(),
		endedAt: null,
	});
	const [isStrangerTyping, setIsStrangerTyping] = useState(false);
	const [isStrangerConnected, setIsStrangerConnected] = useState(false);

	const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
	const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastTypingBroadcastRef = useRef(0);

	const endChat = useCallback(() => {
		const channel = channelRef.current;
		if (channel && session.status === "active") {
			channel.send({
				type: "broadcast",
				event: "end_chat",
				payload: { sender_id: userId } satisfies BroadcastEndPayload,
			});
		}

		setSession((prev) => ({
			...prev,
			status: "ended",
			endedAt: new Date(),
		}));

		supabase
			.from("rooms")
			.update({ status: "ended", ended_at: new Date().toISOString() })
			.eq("id", roomId)
			.then(() => {});
	}, [roomId, userId, session.status]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: channel setup runs once on mount
	useEffect(() => {
		if (!userId || !roomId) return;

		const channel = supabase.channel(`chat:${roomId}`, {
			config: { broadcast: { self: false }, presence: { key: userId } },
		});

		channelRef.current = channel;

		channel.on("broadcast", { event: "message" }, (p: { payload: unknown }) =>
			handleIncomingMessage(p, userId, setSession, setIsStrangerTyping),
		);
		channel.on("broadcast", { event: "typing" }, (p: { payload: unknown }) =>
			handleIncomingTyping(p, userId, setIsStrangerTyping, typingTimeoutRef),
		);
		channel.on("broadcast", { event: "end_chat" }, (p: { payload: unknown }) =>
			handleIncomingEnd(p, userId, setSession, setIsStrangerTyping),
		);
		channel.on("broadcast", { event: "reaction" }, (p: { payload: unknown }) =>
			handleIncomingReaction(p, userId, setSession),
		);
		channel.on("presence", { event: "sync" }, () =>
			handlePresenceSync(channel, userId, setIsStrangerConnected),
		);
		channel.on("presence", { event: "leave" }, ({ leftPresences }) =>
			handlePresenceLeave(
				leftPresences as Array<Record<string, unknown>>,
				userId,
				setIsStrangerConnected,
				setSession,
			),
		);

		channel.subscribe(async (status) => {
			if (status === "SUBSCRIBED") {
				await channel.track({ user_id: userId, joined_at: Date.now() });
				setSession((prev) => ({
					...prev,
					status: "active",
					startedAt: new Date(),
				}));
			}
		});

		return () => {
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}
			supabase.removeChannel(channel);
			channelRef.current = null;
		};
	}, [userId, roomId]);

	const sendMessage = useCallback(
		(text: string) => {
			if (session.status !== "active" || !text.trim() || !channelRef.current) {
				return;
			}

			const msgPayload: BroadcastMessagePayload = {
				id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
				sender_id: userId,
				text: text.trim(),
				timestamp: new Date().toISOString(),
			};

			const msg: ChatMessage = {
				id: msgPayload.id,
				senderId: userId,
				text: msgPayload.text,
				timestamp: new Date(msgPayload.timestamp),
			};
			setSession((prev) => ({
				...prev,
				messages: [...prev.messages, msg],
			}));

			channelRef.current.send({
				type: "broadcast",
				event: "message",
				payload: msgPayload,
			});

			lastTypingBroadcastRef.current = 0;
		},
		[userId, session.status],
	);

	const broadcastTyping = useCallback(() => {
		const now = Date.now();
		if (
			now - lastTypingBroadcastRef.current < 1000 ||
			!channelRef.current ||
			session.status !== "active"
		) {
			return;
		}
		lastTypingBroadcastRef.current = now;
		channelRef.current.send({
			type: "broadcast",
			event: "typing",
			payload: {
				sender_id: userId,
				is_typing: true,
			} satisfies BroadcastTypingPayload,
		});
	}, [userId, session.status]);

	/**
	 * Toggles the current user's reaction for a given message. If the user
	 * already reacted with this emoji we remove it; otherwise we add it.
	 * Optimistically updates local state and fans out over Broadcast.
	 */
	const toggleReaction = useCallback(
		(messageId: string, emoji: string) => {
			if (session.status !== "active" || !channelRef.current) return;

			let action: "add" | "remove" = "add";
			setSession((prev) => {
				const target = prev.messages.find((m) => m.id === messageId);
				const alreadyReacted = target?.reactions?.[emoji]?.includes(userId);
				action = alreadyReacted ? "remove" : "add";
				return {
					...prev,
					messages: applyReactionUpdate(
						prev.messages,
						messageId,
						emoji,
						userId,
						action,
					),
				};
			});

			channelRef.current.send({
				type: "broadcast",
				event: "reaction",
				payload: {
					sender_id: userId,
					message_id: messageId,
					emoji,
					action,
				} satisfies BroadcastReactionPayload,
			});
		},
		[userId, session.status],
	);

	return {
		session,
		sendMessage,
		endChat,
		broadcastTyping,
		toggleReaction,
		isStrangerTyping,
		isStrangerConnected,
		channelRef,
	};
}
