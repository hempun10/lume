import { Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { MatchStatus } from "../hooks/use-matchmaking";
import type { MatchMode } from "../types";

interface SearchingViewProps {
	mode: MatchMode;
	interests: string[];
	elapsedSeconds: number;
	matchStatus: MatchStatus;
	onCancel: () => void;
}

function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getStatusText(status: MatchStatus): string {
	switch (status) {
		case "queuing":
			return "Joining queue...";
		case "searching":
			return "Looking for a stranger...";
		case "matched":
			return "Match found!";
		case "navigating":
			return "Connecting...";
		default:
			return "Looking for a stranger...";
	}
}

export function SearchingView({
	mode,
	interests,
	elapsedSeconds,
	matchStatus,
	onCancel,
}: SearchingViewProps) {
	const isMatched = matchStatus === "matched" || matchStatus === "navigating";

	return (
		<div className="flex h-full flex-col items-center justify-center px-4">
			<Card className="w-full max-w-sm">
				<CardContent className="flex flex-col items-center gap-6 py-8">
					{/* Animated loader / success indicator */}
					<div className="relative">
						{isMatched ? (
							<div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-green-500 bg-green-500/10">
								<Check className="h-10 w-10 text-green-500" />
							</div>
						) : (
							<>
								<div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/20">
									<Loader2 className="h-10 w-10 animate-spin text-primary" />
								</div>
								<span className="absolute -bottom-1 -right-1 flex h-5 w-5">
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
									<span className="relative inline-flex h-5 w-5 rounded-full bg-primary" />
								</span>
							</>
						)}
					</div>

					{/* Status text */}
					<div className="space-y-1 text-center">
						<h2 className="text-lg font-semibold text-foreground">
							{getStatusText(matchStatus)}
						</h2>
						<p className="text-sm text-muted-foreground">
							Mode: {mode === "text" ? "Text Chat" : "Games"}
						</p>
					</div>

					{/* Interests */}
					{interests.length > 0 && (
						<div className="flex flex-wrap justify-center gap-1.5">
							{interests.map((interest) => (
								<Badge key={interest} variant="outline" className="text-xs">
									{interest}
								</Badge>
							))}
						</div>
					)}

					{/* Cancel button — hidden once matched */}
					{!isMatched && (
						<Button variant="outline" onClick={onCancel} className="w-full">
							Cancel
						</Button>
					)}

					{/* Timer */}
					<p className="text-xs text-muted-foreground">
						{isMatched
							? "Connecting you now..."
							: `Searching for ${formatTime(elapsedSeconds)}...`}
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
