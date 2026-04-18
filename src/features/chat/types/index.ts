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
}

export type ChatStatus = "connecting" | "active" | "ended" | "disconnected";

export interface ChatSession {
	status: ChatStatus;
	messages: ChatMessage[];
	startedAt: Date;
	endedAt: Date | null;
}
