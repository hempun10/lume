import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/features/auth";
import { GAMES } from "../../games/data/games";
import {
	clearPendingGame,
	getPendingGame,
} from "../../games/data/pending-game";
import { useGameInvite } from "../hooks/use-game-invite";
import { useRealtimeChat } from "../hooks/use-realtime-chat";
import { useStrangerProfile } from "../hooks/use-stranger-profile";
import { ChatEndedView } from "./chat-ended-view";
import { ChatHeader } from "./chat-header";
import { GameInviteModal } from "./game-invite-modal";
import { GamePanel } from "./game-panel";
import { MessageInput } from "./message-input";
import { MessageList } from "./message-list";
import { PromptSuggestions } from "./prompt-suggestions";
import { ReportDialog } from "./report-dialog";

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
		channelRef,
	} = useRealtimeChat(roomId);
	const navigate = useNavigate();
	const [showGame, setShowGame] = useState(false);
	const { data: strangerProfile } = useStrangerProfile(roomId, userId);

	const gameInvite = useGameInvite(channelRef, userId);
	const [reportOpen, setReportOpen] = useState(false);

	// Auto-open game panel when invite is accepted (by either side)
	useEffect(() => {
		if (gameInvite.status === "accepted") {
			setShowGame(true);
		}
	}, [gameInvite.status]);

	/**
	 * If the user arrived from the games catalog (Play → match → chat),
	 * auto-send the invite and open the game panel the moment the chat
	 * is connected. Fires exactly once, only when no invite is already
	 * in flight, and clears the pending intent so a refresh doesn't
	 * repeat it.
	 */
	const autoInvitedRef = useRef(false);
	useEffect(() => {
		if (autoInvitedRef.current) return;
		if (session.status !== "active") return;
		if (gameInvite.status !== "idle") return;

		const pending = getPendingGame();
		if (!pending) return;

		const game = GAMES.find(
			(g) => g.id === pending && g.status === "available",
		);
		clearPendingGame();
		if (!game) return;

		autoInvitedRef.current = true;
		setShowGame(true);
		gameInvite.sendInvite(game.id, game.name);
	}, [session.status, gameInvite]);

	function handleBackToLobby() {
		navigate({ to: "/dashboard" });
	}

	function handleNewMatch() {
		navigate({ to: "/dashboard" });
	}

	function handleToggleGame() {
		setShowGame((prev) => !prev);
		// If closing the panel, reset invite state if idle/rejected
		if (showGame) {
			if (gameInvite.status === "idle" || gameInvite.status === "rejected") {
				gameInvite.reset();
			}
		}
	}

	function handleCloseGame() {
		setShowGame(false);
		if (gameInvite.status === "idle" || gameInvite.status === "rejected") {
			gameInvite.reset();
		}
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
				partnerId={strangerProfile?.userId ?? null}
				roomId={roomId}
			/>
		);
	}

	return (
		<div className="flex h-full">
			{/* Chat column — takes remaining space */}
			<div className="flex min-w-0 flex-1 flex-col">
				<ChatHeader
					startedAt={session.startedAt}
					onEnd={endChat}
					isStrangerConnected={isStrangerConnected}
					showGame={showGame}
					onToggleGame={handleToggleGame}
					isGameBanned={gameInvite.isBanned}
					onToggleBan={gameInvite.toggleBan}
					onReport={
						strangerProfile?.userId ? () => setReportOpen(true) : undefined
					}
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

			{/* Game panel — 40% width on desktop */}
			{showGame && (
				<div className="hidden w-[40%] shrink-0 border-l border-border/50 md:flex">
					<div className="flex-1">
						<GamePanel
							roomId={roomId}
							inviteStatus={gameInvite.status}
							acceptedGameId={gameInvite.acceptedGameId}
							onInvite={gameInvite.sendInvite}
							onResetInvite={gameInvite.reset}
							onLeaveGame={gameInvite.leaveGame}
							onClose={handleCloseGame}
						/>
					</div>
				</div>
			)}

			{/* Incoming game invite modal */}
			{gameInvite.status === "invited" && gameInvite.incomingInvite && (
				<GameInviteModal
					invite={gameInvite.incomingInvite}
					onAccept={gameInvite.acceptInvite}
					onReject={gameInvite.rejectInvite}
					onBan={gameInvite.toggleBan}
				/>
			)}

			{/* Report dialog (in-chat). End the chat on submit so matchmaking
			    can't immediately pair them again. */}
			{strangerProfile?.userId && (
				<ReportDialog
					open={reportOpen}
					onOpenChange={setReportOpen}
					reportedUserId={strangerProfile.userId}
					roomId={roomId}
					onSubmitted={endChat}
				/>
			)}
		</div>
	);
}
