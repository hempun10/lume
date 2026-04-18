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

/**
 * A GIF payload attached to a message. We keep intrinsic dimensions so
 * the bubble can reserve space while the image loads (avoids layout
 * shift on slow connections).
 */
export interface GifAttachment {
	url: string;
	width: number;
	height: number;
	title?: string;
}

export interface ChatMessage {
	id: string;
	senderId: string;
	text: string;
	timestamp: Date;
	reactions?: Record<string, string[]>;
	replyTo?: ReplyTarget;
	/**
	 * Optional GIF attachment. When present the bubble renders the image
	 * in place of text content.
	 */
	gif?: GifAttachment;
}

export type ChatStatus = "connecting" | "active" | "ended" | "disconnected";

export interface ChatSession {
	status: ChatStatus;
	messages: ChatMessage[];
	startedAt: Date;
	endedAt: Date | null;
}
