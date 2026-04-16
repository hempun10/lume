import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/features/auth";
import { useRealtimeChat } from "../hooks/use-realtime-chat";
import { useStrangerProfile } from "../hooks/use-stranger-profile";
import { ChatEndedView } from "./chat-ended-view";
import { ChatHeader } from "./chat-header";
import { GamePanel } from "./game-panel";
import { MessageInput } from "./message-input";
import { MessageList } from "./message-list";
import { PromptSuggestions } from "./prompt-suggestions";

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
	const [showGame, setShowGame] = useState(false);
	const { data: strangerProfile } = useStrangerProfile(roomId, userId);

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
		<div className="flex h-full">
			{/* Chat column */}
			<div className="flex flex-1 flex-col min-w-0">
				<ChatHeader
					startedAt={session.startedAt}
					onEnd={endChat}
					isStrangerConnected={isStrangerConnected}
					showGame={showGame}
					onToggleGame={() => setShowGame((prev) => !prev)}
				/>
				<MessageList
					messages={session.messages}
					isStrangerTyping={isStrangerTyping}
					userId={userId}
					strangerInterests={strangerProfile?.interests}
					onPromptSelect={sendMessage}
				/>
				{session.messages.length > 0 &&
					strangerProfile?.interests &&
					strangerProfile.interests.length > 0 && (
						<PromptSuggestions
							interests={strangerProfile.interests}
							onSelect={sendMessage}
						/>
					)}
				<MessageInput onSend={sendMessage} onTyping={broadcastTyping} />
			</div>

			{/* Game panel — side-by-side on desktop, hidden on mobile for now */}
			{showGame && (
				<div className="hidden w-96 shrink-0 border-l border-border/50 md:flex">
					<div className="flex-1">
						<GamePanel roomId={roomId} onClose={() => setShowGame(false)} />
					</div>
				</div>
			)}
		</div>
	);
}
