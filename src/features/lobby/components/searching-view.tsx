import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
	return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function getStatusLine(status: MatchStatus): {
	eyebrow: string;
	heading: string;
} {
	switch (status) {
		case "queuing":
			return { eyebrow: "Queue", heading: "Joining the queue" };
		case "matched":
			return { eyebrow: "Match", heading: "Match found" };
		case "navigating":
			return { eyebrow: "Match", heading: "Connecting you now" };
		default:
			return { eyebrow: "Searching", heading: "Looking for someone" };
	}
}

export function SearchingView({
	interests,
	elapsedSeconds,
	matchStatus,
	onCancel,
}: SearchingViewProps) {
	const isMatched = matchStatus === "matched" || matchStatus === "navigating";
	const { eyebrow, heading } = getStatusLine(matchStatus);

	return (
		<div className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center gap-10 px-4 py-10 duration-500 animate-in fade-in">
			<div
				aria-hidden
				className="relative flex size-32 items-center justify-center"
			>
				{isMatched ? (
					<div className="flex size-20 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500/10 duration-300 animate-in fade-in zoom-in-95">
						<Check className="size-10 text-emerald-500" />
					</div>
				) : (
					<>
						<span className="absolute size-full rounded-full bg-primary/15 motion-safe:animate-ping motion-safe:[animation-duration:2.5s]" />
						<span className="absolute size-2/3 rounded-full bg-primary/20 motion-safe:animate-ping motion-safe:[animation-delay:800ms] motion-safe:[animation-duration:2.5s]" />
						<span className="absolute size-1/3 rounded-full bg-primary/25 motion-safe:animate-ping motion-safe:[animation-delay:1600ms] motion-safe:[animation-duration:2.5s]" />
						<span className="relative size-3 rounded-full bg-primary" />
					</>
				)}
			</div>

			<div className="space-y-3 text-center">
				<p className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
					{eyebrow}
				</p>
				<h1 className="text-balance font-semibold text-3xl text-foreground tracking-tight md:text-4xl">
					{heading}
				</h1>
				{!isMatched && (
					<p className="font-mono text-5xl text-foreground tabular-nums md:text-6xl">
						{formatTime(elapsedSeconds)}
					</p>
				)}
			</div>

			{!isMatched && interests.length > 0 && (
				<div className="flex flex-col items-center gap-2">
					<p className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
						Matching on
					</p>
					<div className="flex flex-wrap justify-center gap-1.5">
						{interests.map((interest) => (
							<Badge key={interest} variant="outline" className="text-xs">
								{interest}
							</Badge>
						))}
					</div>
				</div>
			)}

			{isMatched && (
				<p className="text-pretty text-center text-muted-foreground text-sm">
					Say hi when you&rsquo;re in.
				</p>
			)}

			{!isMatched && (
				<Button
					variant="ghost"
					onClick={onCancel}
					className="text-muted-foreground transition-[color,transform] duration-150 ease-out hover:text-foreground active:scale-[0.97]"
				>
					Cancel
				</Button>
			)}
		</div>
	);
}
