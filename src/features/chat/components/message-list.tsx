import { useCallback, useEffect, useMemo, useRef } from "react";
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

/**
 * iMessage-style grouping metadata. We compute this once per render so
 * each row can pick the right corner radii, decide whether to draw the
 * tail, and whether to insert a time separator above itself.
 *
 * Rules:
 * - Two messages belong to the same "group" when the sender matches and
 *   they were sent within 60 seconds of each other.
 * - A time separator is rendered above a message when the gap to the
 *   previous one is >= 15 minutes (or the message is the first).
 */
interface GroupMeta {
	isFirstInGroup: boolean;
	isLastInGroup: boolean;
	showTimeSeparator: boolean;
}

const GROUP_GAP_MS = 60_000; // 60s
const SEPARATOR_GAP_MS = 15 * 60_000; // 15m

function computeGroupMeta(messages: ChatMessage[]): GroupMeta[] {
	return messages.map((msg, idx) => {
		const prev = messages[idx - 1];
		const next = messages[idx + 1];
		const prevGap = prev
			? msg.timestamp.getTime() - prev.timestamp.getTime()
			: Number.POSITIVE_INFINITY;
		const nextGap = next
			? next.timestamp.getTime() - msg.timestamp.getTime()
			: Number.POSITIVE_INFINITY;
		const isFirstInGroup =
			!prev || prev.senderId !== msg.senderId || prevGap > GROUP_GAP_MS;
		const isLastInGroup =
			!next || next.senderId !== msg.senderId || nextGap > GROUP_GAP_MS;
		const showTimeSeparator = !prev || prevGap >= SEPARATOR_GAP_MS;
		return { isFirstInGroup, isLastInGroup, showTimeSeparator };
	});
}

/**
 * iMessage-style divider: "Today 6:51 am", "Yesterday 1:48 pm",
 * "Mon 9:02 am", or "Mar 4, 10:20 am" depending on distance.
 */
function formatSeparator(date: Date): string {
	const now = new Date();
	const startOfToday = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
	).getTime();
	const msgDay = new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
	).getTime();
	const dayDiff = Math.round((startOfToday - msgDay) / 86_400_000);
	const time = date
		.toLocaleTimeString([], {
			hour: "numeric",
			minute: "2-digit",
		})
		.toLowerCase();
	if (dayDiff === 0) return `Today ${time}`;
	if (dayDiff === 1) return `Yesterday ${time}`;
	if (dayDiff < 7)
		return `${date.toLocaleDateString([], { weekday: "short" })} ${time}`;
	return `${date.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
}

/**
 * SVG tail attached to the last bubble of a group. Positioned absolutely
 * at the bottom-outer corner. The tail shape is an iMessage-style
 * teardrop: a small curve that sits flush with the bubble's rounded
 * bottom edge.
 *
 * We render two overlapping paths — one matching the bubble color, one
 * matching the background — so the tail reads cleanly against any
 * surface without needing a mask.
 */
function BubbleTail({
	side,
	colorClass,
}: {
	side: "left" | "right";
	colorClass: string;
}) {
	return (
		<span
			aria-hidden
			className={cn(
				"pointer-events-none absolute bottom-0 h-[18px] w-[12px]",
				side === "right" ? "-right-[6px]" : "-left-[6px]",
			)}
		>
			<svg
				viewBox="0 0 12 18"
				className={cn("h-full w-full", colorClass)}
				preserveAspectRatio="none"
			>
				<title>tail</title>
				{side === "right" ? (
					<path
						d="M0 0 L0 14 C0 16 2 18 6 18 L12 18 C8 17 4 13 4 8 L4 0 Z"
						fill="currentColor"
					/>
				) : (
					<path
						d="M12 0 L12 14 C12 16 10 18 6 18 L0 18 C4 17 8 13 8 8 L8 0 Z"
						fill="currentColor"
					/>
				)}
			</svg>
		</span>
	);
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

	const handleGifLoad = useCallback(
		(messageId: string) => {
			if (messages[messages.length - 1]?.id !== messageId) return;
			bottomRef.current?.scrollIntoView({ behavior: "smooth" });
		},
		[messages],
	);

	const groupMeta = useMemo(() => computeGroupMeta(messages), [messages]);

	// Index of the most recent own message — used to render the
	// "Delivered" caption only under the very last sent bubble.
	const lastOwnIndex = useMemo(() => {
		for (let i = messages.length - 1; i >= 0; i--) {
			if (messages[i].senderId === userId) return i;
		}
		return -1;
	}, [messages, userId]);

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
			className="flex flex-1 flex-col overflow-y-auto px-4 py-3"
		>
			{messages.map((msg, idx) => {
				const isOwn = msg.senderId === userId;
				const meta = groupMeta[idx];
				const { isFirstInGroup, isLastInGroup, showTimeSeparator } = meta;

				// Corner radii: the corner on the sender's side collapses
				// between consecutive bubbles so the group reads as a single
				// shape. The off-side stays fully rounded.
				const bubbleRadius = isOwn
					? cn(
							"rounded-2xl",
							!isFirstInGroup && "rounded-tr-md",
							!isLastInGroup && "rounded-br-md",
						)
					: cn(
							"rounded-2xl",
							!isFirstInGroup && "rounded-tl-md",
							!isLastInGroup && "rounded-bl-md",
						);

				// Mine = iMessage blue. Theirs = neutral gray (muted).
				const isGifOnly = Boolean(msg.gif) && !msg.text;
				const bubbleColor = isGifOnly
					? "bg-transparent"
					: isOwn
						? "bg-[#007AFF] text-white"
						: "bg-muted text-foreground";

				// Spacing: 2px between same-sender bubbles within a group,
				// larger gap when the group ends.
				const rowSpacing = isLastInGroup ? "mt-2" : "mt-[2px]";
				const firstRowSpacing = idx === 0 ? "" : rowSpacing;

				return (
					<div key={msg.id} className="flex flex-col">
						{showTimeSeparator ? (
							<div className="my-3 flex justify-center">
								<span className="text-[11px] font-semibold text-muted-foreground/80">
									{formatSeparator(msg.timestamp)}
								</span>
							</div>
						) : null}
						<div
							data-message-id={msg.id}
							className={cn(
								"group flex flex-col",
								isOwn ? "items-end" : "items-start",
								showTimeSeparator ? "" : firstRowSpacing,
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
										"relative flex max-w-full flex-col overflow-visible text-sm transition-[box-shadow] duration-200",
										bubbleRadius,
										bubbleColor,
										isGifOnly ? "" : "px-3.5 py-1.5",
									)}
								>
									{/* GIF + reply preview need the bubble's rounded clip.
									    We apply overflow-hidden to an inner wrapper so the
									    tail SVG (which extends outside the bubble) is not
									    clipped. */}
									<div
										className={cn(
											"flex flex-col",
											isGifOnly ? "overflow-hidden rounded-2xl" : "",
										)}
									>
										{msg.replyTo ? (
											<button
												type="button"
												onClick={() => {
													if (msg.replyTo) scrollToMessage(msg.replyTo.id);
												}}
												className={cn(
													// Inset panel inside the bubble. No left stripe —
													// the tint alone separates it from the bubble body.
													"-mx-1.5 -mt-0.5 mb-1 flex flex-col items-start gap-0.5 rounded-xl px-2.5 py-1.5 text-left text-xs transition-colors",
													isGifOnly
														? "bg-muted/80 hover:bg-muted"
														: isOwn
															? "bg-white/20 hover:bg-white/25"
															: "bg-background/70 hover:bg-background/90",
												)}
												aria-label="Jump to replied message"
											>
												<span
													className={cn(
														"font-semibold",
														isOwn && !isGifOnly
															? "text-white/95"
															: "text-foreground",
													)}
												>
													{msg.replyTo.senderId === userId ? "You" : "Stranger"}
												</span>
												<span
													className={cn(
														"line-clamp-1 break-words",
														isOwn && !isGifOnly
															? "text-white/75"
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
													msg.text ? "mb-1 rounded-xl" : "",
												)}
											/>
										) : null}
										{msg.text ? (
											<span className="break-words leading-[1.35]">
												{msg.text}
											</span>
										) : null}
									</div>
									{/* Tail only on the last bubble of a group, and only when
									    the bubble has a solid background (skip for GIF-only). */}
									{isLastInGroup && !isGifOnly ? (
										<BubbleTail
											side={isOwn ? "right" : "left"}
											colorClass={isOwn ? "text-[#007AFF]" : "text-muted"}
										/>
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
							{isOwn && idx === lastOwnIndex && isLastInGroup ? (
								<span className="mt-0.5 mr-1 text-[11px] font-medium text-muted-foreground">
									Delivered
								</span>
							) : null}
						</div>
					</div>
				);
			})}

			{isStrangerTyping && (
				<div className="mt-2 flex justify-start">
					<div className="relative rounded-2xl rounded-bl-md bg-muted px-4 py-2">
						<div className="flex gap-1">
							<span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
							<span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
							<span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
						</div>
						<BubbleTail side="left" colorClass="text-muted" />
					</div>
				</div>
			)}

			<div ref={bottomRef} />
		</div>
	);
}
