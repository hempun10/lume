import { Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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

	return (
		<form
			onSubmit={handleSubmit}
			className="flex shrink-0 items-end gap-2 border-t border-border/50 p-4"
		>
			<textarea
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
