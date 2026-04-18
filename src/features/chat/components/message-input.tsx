import { Send, Smile, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	EmojiPicker,
	EmojiPickerContent,
	EmojiPickerFooter,
	EmojiPickerSearch,
} from "@/components/ui/emoji-picker";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { ReplyTarget } from "../types";

interface MessageInputProps {
	onSend: (text: string, replyTo?: ReplyTarget) => void;
	onTyping?: () => void;
	disabled?: boolean;
	replyTo?: ReplyTarget | null;
	onCancelReply?: () => void;
	currentUserId?: string;
}

export function MessageInput({
	onSend,
	onTyping,
	disabled,
	replyTo,
	onCancelReply,
	currentUserId,
}: MessageInputProps) {
	const [value, setValue] = useState("");
	const [emojiOpen, setEmojiOpen] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Auto-focus the textarea when entering reply mode so the user can
	// start typing immediately.
	useEffect(() => {
		if (replyTo) {
			textareaRef.current?.focus();
		}
	}, [replyTo]);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!value.trim() || disabled) return;
		onSend(value, replyTo ?? undefined);
		setValue("");
		onCancelReply?.();
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
			return;
		}
		if (e.key === "Escape" && replyTo) {
			e.preventDefault();
			onCancelReply?.();
		}
	}

	function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
		setValue(e.target.value);
		onTyping?.();
	}

	function handleEmojiSelect(emoji: string) {
		const el = textareaRef.current;
		if (!el) {
			setValue((prev) => prev + emoji);
			setEmojiOpen(false);
			return;
		}
		const start = el.selectionStart ?? value.length;
		const end = el.selectionEnd ?? value.length;
		const next = `${value.slice(0, start)}${emoji}${value.slice(end)}`;
		setValue(next);
		setEmojiOpen(false);
		requestAnimationFrame(() => {
			el.focus();
			const caret = start + emoji.length;
			el.setSelectionRange(caret, caret);
		});
		onTyping?.();
	}

	const replyLabel =
		replyTo && currentUserId && replyTo.senderId === currentUserId
			? "yourself"
			: "stranger";

	return (
		<div className="shrink-0 border-t border-border/50">
			{replyTo ? (
				<div className="flex items-start gap-2 px-4 pt-3">
					<div className="flex min-w-0 flex-1 items-stretch gap-2 rounded-lg border-l-2 border-primary bg-muted/60 px-3 py-2">
						<div className="min-w-0 flex-1">
							<p className="text-xs font-medium text-primary">
								Replying to {replyLabel}
							</p>
							<p className="truncate text-xs text-muted-foreground">
								{replyTo.text}
							</p>
						</div>
						<button
							type="button"
							onClick={onCancelReply}
							className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
							aria-label="Cancel reply"
						>
							<X className="h-3.5 w-3.5" />
						</button>
					</div>
				</div>
			) : null}
			<form onSubmit={handleSubmit} className="flex items-end gap-2 p-4">
				<Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
					<PopoverTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							disabled={disabled}
							className="shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
							aria-label="Insert emoji"
						>
							<Smile className="h-5 w-5" />
						</Button>
					</PopoverTrigger>
					<PopoverContent
						align="start"
						side="top"
						sideOffset={8}
						className="w-fit p-0"
					>
						<EmojiPicker
							className="h-[340px]"
							onEmojiSelect={({ emoji }) => handleEmojiSelect(emoji)}
						>
							<EmojiPickerSearch placeholder="Search emoji…" />
							<EmojiPickerContent />
							<EmojiPickerFooter />
						</EmojiPicker>
					</PopoverContent>
				</Popover>
				<textarea
					ref={textareaRef}
					value={value}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					placeholder={replyTo ? "Reply…" : "Type a message..."}
					disabled={disabled}
					rows={1}
					className="flex-1 resize-none rounded-xl border border-input bg-transparent px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
				/>
				<Button
					type="submit"
					size="icon"
					disabled={disabled || !value.trim()}
					className="shrink-0 rounded-xl"
				>
					<Send className="h-4 w-4" />
					<span className="sr-only">Send message</span>
				</Button>
			</form>
		</div>
	);
}
