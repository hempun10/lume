import { createFileRoute, Navigate } from "@tanstack/react-router";
import { ChatView } from "@/features/chat";

interface ChatSearchParams {
	roomId?: string;
}

export const Route = createFileRoute("/_authenticated/chat")({
	validateSearch: (search: Record<string, unknown>): ChatSearchParams => ({
		roomId:
			typeof search.roomId === "string" && search.roomId.length > 0
				? search.roomId
				: undefined,
	}),
	head: () => ({
		meta: [{ title: "Chat | Lume" }, { name: "robots", content: "noindex" }],
	}),
	component: ChatPage,
});

function ChatPage() {
	const { roomId } = Route.useSearch();

	if (!roomId) {
		return <Navigate to="/dashboard" />;
	}

	return <ChatView roomId={roomId} />;
}
