export interface ChatMessage {
	id: string;
	sender: "user" | "stranger";
	text: string;
	timestamp: Date;
}

export type ChatStatus = "active" | "ended";

export interface ChatSession {
	status: ChatStatus;
	messages: ChatMessage[];
	startedAt: Date;
	endedAt: Date | null;
}
