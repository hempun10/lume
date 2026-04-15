import { useCallback, useRef, useState } from "react";
import type { ChatMessage, ChatSession, ChatStatus } from "../types";

const MOCK_RESPONSES = [
	"Hey! How's it going?",
	"That's cool! Tell me more",
	"I totally agree with that",
	"Haha nice one",
	"What kind of music are you into?",
	"I've been binge watching shows lately",
	"Do you play any games?",
	"Where are you from?",
	"That's really interesting!",
	"I never thought of it that way",
];

function createMessage(sender: "user" | "stranger", text: string): ChatMessage {
	return {
		id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
		sender,
		text,
		timestamp: new Date(),
	};
}

interface UseChatReturn {
	session: ChatSession;
	sendMessage: (text: string) => void;
	endChat: () => void;
	isStrangerTyping: boolean;
}

/**
 * Mock chat hook that simulates a stranger responding.
 * TODO: Replace with Supabase Realtime channels for real messaging.
 */
export function useChat(): UseChatReturn {
	const [session, setSession] = useState<ChatSession>({
		status: "active",
		messages: [],
		startedAt: new Date(),
		endedAt: null,
	});
	const [isStrangerTyping, setIsStrangerTyping] = useState(false);
	const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const sendMessage = useCallback(
		(text: string) => {
			if (session.status !== "active" || !text.trim()) return;

			const userMessage = createMessage("user", text.trim());
			setSession((prev) => ({
				...prev,
				messages: [...prev.messages, userMessage],
			}));

			// Simulate stranger typing + response
			setIsStrangerTyping(true);
			const delay = 1000 + Math.random() * 2000;

			typingTimeoutRef.current = setTimeout(() => {
				setIsStrangerTyping(false);
				const response =
					MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
				const strangerMessage = createMessage("stranger", response);
				setSession((prev) => ({
					...prev,
					messages: [...prev.messages, strangerMessage],
				}));
			}, delay);
		},
		[session.status],
	);

	const endChat = useCallback(() => {
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
			typingTimeoutRef.current = null;
		}
		setIsStrangerTyping(false);
		setSession((prev) => ({
			...prev,
			status: "ended" as ChatStatus,
			endedAt: new Date(),
		}));
	}, []);

	return { session, sendMessage, endChat, isStrangerTyping };
}
