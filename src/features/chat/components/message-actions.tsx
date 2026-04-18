import { Reply, SmilePlus } from "lucide-react";
import { useState } from "react";
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
import { cn } from "@/lib/utils";

interface MessageActionsProps {
	messageId: string;
	alignRight?: boolean;
	onReact: (messageId: string, emoji: string) => void;
	onReply?: (messageId: string) => void;
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"] as const;

/**
 * Floating toolbar that appears next to a message bubble on hover (or
 * focus) giving fast access to a small palette of reactions plus a
 * "more" button that opens the full emoji picker.
 */
export function MessageActions({
	messageId,
	alignRight,
	onReact,
	onReply,
}: MessageActionsProps) {
	const [pickerOpen, setPickerOpen] = useState(false);

	function handleQuick(emoji: string) {
		onReact(messageId, emoji);
	}

	function handlePick(emoji: string) {
		onReact(messageId, emoji);
		setPickerOpen(false);
	}

	return (
		<div
			className={cn(
				"flex items-center gap-0.5 rounded-full border border-border/60 bg-popover/95 px-1 py-0.5 shadow-sm backdrop-blur",
				"opacity-0 transition-opacity duration-150",
				"group-hover:opacity-100 focus-within:opacity-100 data-[open=true]:opacity-100",
				alignRight ? "mr-1" : "ml-1",
			)}
			data-open={pickerOpen || undefined}
		>
			{QUICK_REACTIONS.map((emoji) => (
				<button
					key={emoji}
					type="button"
					onClick={() => handleQuick(emoji)}
					className="flex h-7 w-7 items-center justify-center rounded-full text-base transition-transform hover:scale-110 hover:bg-muted focus-visible:scale-110 focus-visible:bg-muted focus-visible:outline-none"
					aria-label={`React with ${emoji}`}
				>
					{emoji}
				</button>
			))}
			<Popover open={pickerOpen} onOpenChange={setPickerOpen}>
				<PopoverTrigger asChild>
					<button
						type="button"
						className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:outline-none"
						aria-label="More reactions"
					>
						<SmilePlus className="h-4 w-4" />
					</button>
				</PopoverTrigger>
				<PopoverContent
					align={alignRight ? "end" : "start"}
					side="top"
					sideOffset={8}
					className="w-fit p-0"
				>
					<EmojiPicker
						className="h-[320px]"
						onEmojiSelect={({ emoji }) => handlePick(emoji)}
					>
						<EmojiPickerSearch placeholder="Search emoji…" />
						<EmojiPickerContent />
						<EmojiPickerFooter />
					</EmojiPicker>
				</PopoverContent>
			</Popover>
			{onReply ? (
				<button
					type="button"
					onClick={() => onReply(messageId)}
					className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:outline-none"
					aria-label="Reply to message"
				>
					<Reply className="h-4 w-4" />
				</button>
			) : null}
		</div>
	);
}
