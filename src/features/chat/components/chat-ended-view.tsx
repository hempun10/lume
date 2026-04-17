import { ArrowLeft, Flag, RotateCw, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ReportDialog } from "./report-dialog";

interface ChatEndedViewProps {
	duration: number;
	messageCount: number;
	onNewMatch: () => void;
	onBackToLobby: () => void;
	/** If null, the Report button is hidden (partner was never resolved). */
	partnerId: string | null;
	roomId: string | null;
}

function formatDuration(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function ChatEndedView({
	duration,
	messageCount,
	onNewMatch,
	onBackToLobby,
	partnerId,
	roomId,
}: ChatEndedViewProps) {
	const [reportOpen, setReportOpen] = useState(false);
	const [feedback, setFeedback] = useState<"good" | "bad" | null>(null);
	const [reported, setReported] = useState(false);

	return (
		<div className="flex h-full flex-col items-center justify-center px-4">
			<Card className="w-full max-w-sm">
				<CardHeader className="text-center">
					<CardTitle>Chat ended</CardTitle>
					<CardDescription>
						{formatDuration(duration)} &middot; {messageCount} messages
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Action buttons */}
					<div className="flex gap-2">
						<Button onClick={onNewMatch} className="flex-1 gap-2">
							<RotateCw className="h-4 w-4" />
							New Match
						</Button>
						<Button
							variant="outline"
							onClick={onBackToLobby}
							className="flex-1 gap-2"
						>
							<ArrowLeft className="h-4 w-4" />
							Lobby
						</Button>
					</div>

					{/* Feedback */}
					<div className="space-y-2">
						<p className="text-center text-xs text-muted-foreground">
							{reported
								? "Thanks — our team will take a look."
								: "How was this chat?"}
						</p>
						<div className="flex justify-center gap-2">
							<Button
								variant={feedback === "good" ? "secondary" : "ghost"}
								size="sm"
								className="gap-1.5"
								onClick={() => setFeedback("good")}
								disabled={reported}
							>
								<ThumbsUp className="h-3.5 w-3.5" />
								Good
							</Button>
							<Button
								variant={feedback === "bad" ? "secondary" : "ghost"}
								size="sm"
								className="gap-1.5"
								onClick={() => setFeedback("bad")}
								disabled={reported}
							>
								<ThumbsDown className="h-3.5 w-3.5" />
								Bad
							</Button>
							{partnerId && (
								<Button
									variant="ghost"
									size="sm"
									className="gap-1.5 text-destructive hover:text-destructive"
									onClick={() => setReportOpen(true)}
									disabled={reported}
								>
									<Flag className="h-3.5 w-3.5" />
									Report
								</Button>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{partnerId && (
				<ReportDialog
					open={reportOpen}
					onOpenChange={setReportOpen}
					reportedUserId={partnerId}
					roomId={roomId}
					onSubmitted={() => setReported(true)}
				/>
			)}
		</div>
	);
}
