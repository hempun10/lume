import { useCallback, useEffect, useRef } from "react";
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
	onReply?: (messageId: string) => void;
}

export function MessageList({
	messages,
	isStrangerTyping,
	userId,
	strangerInterests = [],
	onPromptSelect,
	onReact,
	onReply,
}: MessageListProps) {
	const bottomRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const messageCount = messages.length;
	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom when messages change or typing indicator appears
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messageCount, isStrangerTyping]);

	// Jump to the original message when a quoted preview is clicked.
	// We briefly highlight the inner bubble so the user can orient (the
	// outer wrapper includes the reaction row and toolbar, which makes
	// the outline look loose — targeting the inner bubble keeps the cue
	// tight).
	const scrollToMessage = useCallback((id: string) => {
		const container = containerRef.current;
		if (!container) return;
		const wrapper = container.querySelector<HTMLElement>(
			`[data-message-id="${id}"]`,
		);
		if (!wrapper) return;
		wrapper.scrollIntoView({ behavior: "smooth", block: "center" });
		const bubble = wrapper.querySelector<HTMLElement>("[data-bubble]");
		const target = bubble ?? wrapper;
		target.classList.add(
			"ring-2",
			"ring-primary",
			"ring-offset-2",
			"ring-offset-background",
		);
		window.setTimeout(() => {
			target.classList.remove(
				"ring-2",
				"ring-primary",
				"ring-offset-2",
				"ring-offset-background",
			);
		}, 1200);
	}, []);

	// When the most recent message contains a GIF, its image reports its
	// real size only after decoding. That late size change can leave the
	// user scrolled above the bottom. Re-run the scroll whenever such a
	// load completes so the newest content stays in view.
	const handleGifLoad = useCallback(
		(messageId: string) => {
			if (messages[messages.length - 1]?.id !== messageId) return;
			bottomRef.current?.scrollIntoView({ behavior: "smooth" });
		},
		[messages],
	);

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
		<div
			ref={containerRef}
			className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
		>
			{messages.map((msg) => {
				const isOwn = msg.senderId === userId;
				return (
					<div
						key={msg.id}
						data-message-id={msg.id}
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
								data-bubble
								className={cn(
									"flex max-w-full flex-col overflow-hidden rounded-2xl text-sm transition-[box-shadow] duration-200",
									msg.gif && !msg.text ? "bg-transparent" : "px-4 py-2",
									isOwn
										? msg.gif && !msg.text
											? "rounded-br-md"
											: "rounded-br-md bg-primary text-primary-foreground"
										: msg.gif && !msg.text
											? "rounded-bl-md"
											: "rounded-bl-md bg-muted text-foreground",
								)}
							>
								{msg.replyTo ? (
									<button
										type="button"
										onClick={() => {
											if (msg.replyTo) scrollToMessage(msg.replyTo.id);
										}}
										className={cn(
											"mb-1 flex flex-col items-start gap-0.5 rounded-md border-l-2 px-2 py-1 text-left text-xs transition-colors",
											msg.gif && !msg.text
												? "border-primary bg-muted/80 hover:bg-muted"
												: isOwn
													? "-mx-1 border-primary-foreground/60 bg-primary-foreground/10 hover:bg-primary-foreground/15"
													: "-mx-1 border-primary bg-background/60 hover:bg-background/80",
										)}
										aria-label="Jump to replied message"
									>
										<span
											className={cn(
												"font-medium",
												isOwn && !(msg.gif && !msg.text)
													? "text-primary-foreground/90"
													: "text-primary",
											)}
										>
											{msg.replyTo.senderId === userId ? "You" : "Stranger"}
										</span>
										<span
											className={cn(
												"line-clamp-1 break-words",
												isOwn && !(msg.gif && !msg.text)
													? "text-primary-foreground/80"
													: "text-muted-foreground",
											)}
										>
											{msg.replyTo.text}
										</span>
									</button>
								) : null}
								{msg.gif ? (
									<img
										src={msg.gif.url}
										alt={msg.gif.title ?? "GIF"}
										width={msg.gif.width}
										height={msg.gif.height}
										loading="lazy"
										onLoad={() => handleGifLoad(msg.id)}
										className={cn(
											"block h-auto max-w-[240px] bg-muted/60",
											// When the image fills the bubble (no text), the
											// wrapper's rounded-2xl + overflow-hidden already
											// clips it. With text, give the image its own
											// corner radius so it feels tucked inside the bubble.
											msg.text ? "mb-1 rounded-xl" : "",
										)}
									/>
								) : null}
								{msg.text ? (
									<span className="break-words">{msg.text}</span>
								) : null}
							</div>
							{onReact ? (
								<MessageActions
									messageId={msg.id}
									alignRight={isOwn}
									onReact={onReact}
									onReply={onReply}
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
