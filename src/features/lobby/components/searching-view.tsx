import { Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { MatchStatus } from "../hooks/use-matchmaking";

interface SearchingViewProps {
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
			return "Joining queue…";
		case "searching":
			return "Looking for a stranger…";
		case "matched":
			return "Match found!";
		case "navigating":
			return "Connecting…";
		default:
			return "Looking for a stranger…";
	}
}

export function SearchingView({
	interests,
	elapsedSeconds,
	matchStatus,
	onCancel,
}: SearchingViewProps) {
	const isMatched = matchStatus === "matched" || matchStatus === "navigating";

	return (
		<div className="flex h-full flex-col items-center justify-center px-4">
			<Card className="w-full max-w-sm duration-300 animate-in fade-in zoom-in-95">
				<CardContent className="flex flex-col items-center gap-6 py-8">
					<div className="relative">
						{isMatched ? (
							<div className="flex size-20 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500/10">
								<Check className="size-10 text-emerald-500" aria-hidden />
							</div>
						) : (
							<>
								<div className="flex size-20 items-center justify-center rounded-full border-2 border-primary/20">
									<Loader2
										className="size-10 animate-spin text-primary motion-reduce:animate-none"
										aria-hidden
									/>
								</div>
								<span className="-bottom-1 -right-1 absolute flex size-5">
									<span
										className="absolute inline-flex size-full animate-ping rounded-full bg-primary/40 motion-reduce:animate-none"
										aria-hidden
									/>
									<span className="relative inline-flex size-5 rounded-full bg-primary" />
								</span>
							</>
						)}
					</div>

					<div className="space-y-1 text-center">
						<h2 className="text-balance font-semibold text-foreground text-lg">
							{getStatusText(matchStatus)}
						</h2>
					</div>

					{interests.length > 0 && (
						<div className="flex flex-wrap justify-center gap-1.5">
							{interests.map((interest) => (
								<Badge key={interest} variant="outline" className="text-xs">
									{interest}
								</Badge>
							))}
						</div>
					)}

					{!isMatched && (
						<Button
							variant="outline"
							onClick={onCancel}
							className="w-full transition-transform duration-150 ease-out active:scale-[0.98]"
						>
							Cancel
						</Button>
					)}

					<p className="font-mono text-muted-foreground text-xs tabular-nums">
						{isMatched
							? "Connecting you now…"
							: `Searching · ${formatTime(elapsedSeconds)}`}
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
