import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/features/auth";
import { supabase } from "@/lib/supabase/client";
import type { ChatMessage, ChatSession } from "../types";

interface UseRealtimeChatReturn {
	session: ChatSession;
	sendMessage: (text: string) => void;
	endChat: () => void;
	broadcastTyping: () => void;
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

/**
 * Real-time chat hook using Supabase Broadcast + Presence.
 *
 * - Messages are ephemeral (Broadcast only, no DB writes)
 * - Typing indicators via Broadcast
 * - Presence tracking for stranger connected/disconnected
 * - Room status updated to 'ended' on chat end
 *
 * Replaces the mock useChat hook.
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

		// Update room status in DB
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

		// --- Broadcast: message ---
		channel.on("broadcast", { event: "message" }, (payload) => {
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
			// Clear typing when message arrives
			setIsStrangerTyping(false);
		});

		// --- Broadcast: typing ---
		channel.on("broadcast", { event: "typing" }, (payload) => {
			const data = payload.payload as BroadcastTypingPayload;
			if (data.sender_id === userId) return;
			setIsStrangerTyping(data.is_typing);

			// Auto-clear typing after 3s if no update
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}
			if (data.is_typing) {
				typingTimeoutRef.current = setTimeout(() => {
					setIsStrangerTyping(false);
				}, 3000);
			}
		});

		// --- Broadcast: end_chat ---
		channel.on("broadcast", { event: "end_chat" }, (payload) => {
			const data = payload.payload as BroadcastEndPayload;
			if (data.sender_id === userId) return;

			setIsStrangerTyping(false);
			setSession((prev) => ({
				...prev,
				status: "ended",
				endedAt: new Date(),
			}));
		});

		// --- Presence ---
		channel.on("presence", { event: "sync" }, () => {
			const state = channel.presenceState();
			// Check if anyone besides us is present
			const otherPresent = Object.keys(state).some((key) => key !== userId);
			setIsStrangerConnected(otherPresent);
		});

		channel.on("presence", { event: "leave" }, ({ leftPresences }) => {
			const strangerLeft = leftPresences.some(
				(p) => (p as { user_id?: string }).user_id !== userId,
			);
			if (strangerLeft) {
				setIsStrangerConnected(false);
				setSession((prev) => {
					if (prev.status === "active") {
						return {
							...prev,
							status: "disconnected",
							endedAt: new Date(),
						};
					}
					return prev;
				});
			}
		});

		// Subscribe and track presence
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

			// Add to own messages immediately
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

			// Broadcast to stranger
			channelRef.current.send({
				type: "broadcast",
				event: "message",
				payload: msgPayload,
			});

			// Clear own typing indicator
			lastTypingBroadcastRef.current = 0;
		},
		[userId, session.status],
	);

	// Expose a way to broadcast typing — called from MessageInput via onTyping
	// We debounce: only send typing=true at most once per second
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

	return {
		session,
		sendMessage,
		endChat,
		broadcastTyping,
		isStrangerTyping,
		isStrangerConnected,
		channelRef,
	};
}
