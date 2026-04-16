export interface ChatMessage {
	id: string;
	senderId: string;
	text: string;
	timestamp: Date;
}

export type ChatStatus = "connecting" | "active" | "ended" | "disconnected";

export interface ChatSession {
	status: ChatStatus;
	messages: ChatMessage[];
	startedAt: Date;
	endedAt: Date | null;
}
