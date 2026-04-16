import { Clock, Gamepad2, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatHeaderProps {
	startedAt: Date;
	onEnd: () => void;
	isStrangerConnected: boolean;
}

function formatDuration(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function ChatHeader({
	startedAt,
	onEnd,
	isStrangerConnected,
}: ChatHeaderProps) {
	const [elapsed, setElapsed] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setElapsed(Math.floor((Date.now() - startedAt.getTime()) / 1000));
		}, 1000);
		return () => clearInterval(interval);
	}, [startedAt]);

	return (
		<div className="flex h-12 shrink-0 items-center justify-between border-b border-border/50 px-4">
			<div className="flex items-center gap-3">
				<div className="flex items-center gap-2">
					<span className="relative flex h-2 w-2">
						{isStrangerConnected ? (
							<>
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
								<span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
							</>
						) : (
							<span className="relative inline-flex h-2 w-2 rounded-full bg-muted-foreground/50" />
						)}
					</span>
					<span className="text-sm font-medium text-foreground">
						{isStrangerConnected ? "Stranger" : "Disconnected"}
					</span>
				</div>
				<div className="flex items-center gap-1 text-xs text-muted-foreground">
					<Clock className="h-3 w-3" />
					{formatDuration(elapsed)}
				</div>
			</div>

			<div className="flex items-center gap-1">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" size="icon-sm" disabled>
							<Gamepad2 className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>Invite to game (coming soon)</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={onEnd}
							className="text-destructive hover:bg-destructive/10 hover:text-destructive"
						>
							<LogOut className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>End chat</TooltipContent>
				</Tooltip>
			</div>
		</div>
	);
}
