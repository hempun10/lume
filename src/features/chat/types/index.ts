/**
 * A compact snapshot of the message being replied to. We inline the
 * text and sender id on the reply itself so the quoted preview can be
 * rendered without having to look up the original message (which may
 * have been pruned, scrolled off, or may arrive out of order).
 */
export interface ReplyTarget {
	id: string;
	senderId: string;
	text: string;
}

export interface ChatMessage {
	id: string;
	senderId: string;
	text: string;
	timestamp: Date;
	/**
	 * Session-only reactions keyed by emoji. Each entry lists the user ids
	 * that currently hold that reaction. Mutated in-place by broadcast
	 * events; never persisted to the database.
	 */
	reactions?: Record<string, string[]>;
	/**
	 * When present, this message is a reply and carries a snapshot of
	 * the message being quoted.
	 */
	replyTo?: ReplyTarget;
}

export type ChatStatus = "connecting" | "active" | "ended" | "disconnected";

export interface ChatSession {
	status: ChatStatus;
	messages: ChatMessage[];
	startedAt: Date;
	endedAt: Date | null;
}
