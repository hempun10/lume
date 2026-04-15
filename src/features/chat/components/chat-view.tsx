import { useNavigate } from "@tanstack/react-router";
import { useChat } from "../hooks/use-chat";
import { ChatEndedView } from "./chat-ended-view";
import { ChatHeader } from "./chat-header";
import { MessageInput } from "./message-input";
import { MessageList } from "./message-list";

export function ChatView() {
	const { session, sendMessage, endChat, isStrangerTyping } = useChat();
	const navigate = useNavigate();

	function handleBackToLobby() {
		navigate({ to: "/dashboard" });
	}

	function handleNewMatch() {
		// Navigate back to lobby — user can start a new search from there
		// TODO: In future, could auto-start searching with same preferences
		navigate({ to: "/dashboard" });
	}

	if (session.status === "ended") {
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
			<ChatHeader startedAt={session.startedAt} onEnd={endChat} />
			<MessageList
				messages={session.messages}
				isStrangerTyping={isStrangerTyping}
			/>
			<MessageInput onSend={sendMessage} />
		</div>
	);
}
