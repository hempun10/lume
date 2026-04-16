import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "../types";
import { PromptCards } from "./prompt-cards";

interface MessageListProps {
	messages: ChatMessage[];
	isStrangerTyping: boolean;
	userId: string;
	strangerInterests?: string[];
	onPromptSelect?: (text: string) => void;
}

export function MessageList({
	messages,
	isStrangerTyping,
	userId,
	strangerInterests = [],
	onPromptSelect,
}: MessageListProps) {
	const bottomRef = useRef<HTMLDivElement>(null);

	const messageCount = messages.length;
	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom when messages change or typing indicator appears
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messageCount, isStrangerTyping]);

	if (messages.length === 0 && !isStrangerTyping) {
		return onPromptSelect ? (
			<PromptCards interests={strangerInterests} onSelect={onPromptSelect} />
		) : (
			<div className="flex flex-1 items-center justify-center">
				<p className="text-sm text-muted-foreground">
					Say hello to your stranger!
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
			{messages.map((msg) => (
				<div
					key={msg.id}
					className={cn(
						"flex",
						msg.senderId === userId ? "justify-end" : "justify-start",
					)}
				>
					<div
						className={cn(
							"max-w-[75%] break-words rounded-2xl px-4 py-2 text-sm",
							msg.senderId === userId
								? "rounded-br-md bg-primary text-primary-foreground"
								: "rounded-bl-md bg-muted text-foreground",
						)}
					>
						{msg.text}
					</div>
				</div>
			))}

			{isStrangerTyping && (
				<div className="flex justify-start">
					<div className="rounded-2xl rounded-bl-md bg-muted px-4 py-2">
						<div className="flex gap-1">
							<span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
							<span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
							<span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
						</div>
					</div>
				</div>
			)}

			<div ref={bottomRef} />
		</div>
	);
}
