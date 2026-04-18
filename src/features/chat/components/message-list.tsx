import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "../types";
import { MessageActions } from "./message-actions";
import { MessageReactions } from "./message-reactions";
import { PromptCards } from "./prompt-cards";

interface MessageListProps {
	messages: ChatMessage[];
	isStrangerTyping: boolean;
	userId: string;
	strangerInterests?: string[];
	onPromptSelect?: (text: string) => void;
	onReact?: (messageId: string, emoji: string) => void;
}

export function MessageList({
	messages,
	isStrangerTyping,
	userId,
	strangerInterests = [],
	onPromptSelect,
	onReact,
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
			{messages.map((msg) => {
				const isOwn = msg.senderId === userId;
				return (
					<div
						key={msg.id}
						className={cn(
							"group flex flex-col",
							isOwn ? "items-end" : "items-start",
						)}
					>
						<div
							className={cn(
								"flex max-w-[85%] items-center gap-1",
								isOwn ? "flex-row-reverse" : "flex-row",
							)}
						>
							<div
								className={cn(
									"max-w-full break-words rounded-2xl px-4 py-2 text-sm",
									isOwn
										? "rounded-br-md bg-primary text-primary-foreground"
										: "rounded-bl-md bg-muted text-foreground",
								)}
							>
								{msg.text}
							</div>
							{onReact ? (
								<MessageActions
									messageId={msg.id}
									alignRight={isOwn}
									onReact={onReact}
								/>
							) : null}
						</div>
						{msg.reactions && onReact ? (
							<MessageReactions
								reactions={msg.reactions}
								userId={userId}
								alignRight={isOwn}
								onToggle={(emoji) => onReact(msg.id, emoji)}
							/>
						) : null}
					</div>
				);
			})}

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
