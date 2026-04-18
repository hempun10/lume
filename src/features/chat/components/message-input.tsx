import { Send, Smile } from "lucide-react";
import { useRef, useState } from "react";
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

interface MessageInputProps {
	onSend: (text: string) => void;
	onTyping?: () => void;
	disabled?: boolean;
}

export function MessageInput({
	onSend,
	onTyping,
	disabled,
}: MessageInputProps) {
	const [value, setValue] = useState("");
	const [emojiOpen, setEmojiOpen] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!value.trim() || disabled) return;
		onSend(value);
		setValue("");
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
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
		// Restore caret after the inserted emoji on next tick
		requestAnimationFrame(() => {
			el.focus();
			const caret = start + emoji.length;
			el.setSelectionRange(caret, caret);
		});
		onTyping?.();
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="flex shrink-0 items-end gap-2 border-t border-border/50 p-4"
		>
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
				placeholder="Type a message..."
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
	);
}
