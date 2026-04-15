import { createFileRoute } from "@tanstack/react-router";
import { ChatView } from "@/features/chat";

export const Route = createFileRoute("/_authenticated/chat")({
	head: () => ({
		meta: [{ title: "Chat | Lume" }, { name: "robots", content: "noindex" }],
	}),
	component: ChatPage,
});

function ChatPage() {
	return <ChatView />;
}
