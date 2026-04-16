import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/features/auth";
import { useRealtimeChat } from "../hooks/use-realtime-chat";
import { ChatEndedView } from "./chat-ended-view";
import { ChatHeader } from "./chat-header";
import { MessageInput } from "./message-input";
import { MessageList } from "./message-list";

interface ChatViewProps {
	roomId: string;
}

export function ChatView({ roomId }: ChatViewProps) {
	const { user } = useAuth();
	const userId = user?.id ?? "";
	const {
		session,
		sendMessage,
		endChat,
		broadcastTyping,
		isStrangerTyping,
		isStrangerConnected,
	} = useRealtimeChat(roomId);
	const navigate = useNavigate();

	function handleBackToLobby() {
		navigate({ to: "/dashboard" });
	}

	function handleNewMatch() {
		navigate({ to: "/dashboard" });
	}

	if (session.status === "connecting") {
		return (
			<div className="flex h-full items-center justify-center">
				<p className="text-sm text-muted-foreground">Connecting to chat...</p>
			</div>
		);
	}

	if (session.status === "ended" || session.status === "disconnected") {
		const duration = session.endedAt
			? Math.floor(
					(session.endedAt.getTime() - session.startedAt.getTime()) / 1000,
				)
			: 0;
		return (
			<ChatEndedView
				duration={duration}
				messageCount={session.messages.length}
				onNewMatch={handleNewMatch}
				onBackToLobby={handleBackToLobby}
			/>
		);
	}

	return (
		<div className="flex h-full flex-col">
			<ChatHeader
				startedAt={session.startedAt}
				onEnd={endChat}
				isStrangerConnected={isStrangerConnected}
			/>
			<MessageList
				messages={session.messages}
				isStrangerTyping={isStrangerTyping}
				userId={userId}
			/>
			<MessageInput onSend={sendMessage} onTyping={broadcastTyping} />
		</div>
	);
}
