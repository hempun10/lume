import { Gamepad2, MessageCircle, Search, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { MatchMode } from "../types";
import { InterestInput } from "./interest-input";

interface MatchConfigCardProps {
	onStartMatching: (mode: MatchMode, interests: string[]) => void;
}

export function MatchConfigCard({ onStartMatching }: MatchConfigCardProps) {
	const [mode, setMode] = useState<MatchMode>("text");
	const [interests, setInterests] = useState<string[]>([]);

	// Mock online count — will be replaced by real Supabase presence data
	const onlineInQueue = 342;

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Find a Match</CardTitle>
				<CardDescription>
					Choose how you want to connect with a stranger
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Mode toggle */}
				<div className="space-y-2">
					<p className="text-sm font-medium text-foreground">Mode</p>
					<ToggleGroup
						type="single"
						value={mode}
						onValueChange={(value) => {
							if (value) setMode(value as MatchMode);
						}}
						variant="outline"
						className="w-full"
					>
						<ToggleGroupItem
							value="text"
							className="flex-1 gap-2"
							aria-label="Text Chat"
						>
							<MessageCircle className="h-4 w-4" />
							Text Chat
						</ToggleGroupItem>
						<ToggleGroupItem
							value="games"
							className="flex-1 gap-2"
							aria-label="Games"
						>
							<Gamepad2 className="h-4 w-4" />
							Games
						</ToggleGroupItem>
					</ToggleGroup>
				</div>

				{/* Interests */}
				<div className="space-y-2">
					<p className="text-sm font-medium text-foreground">Interests</p>
					<InterestInput interests={interests} onChange={setInterests} />
				</div>

				{/* Start button */}
				<Button
					size="lg"
					className="w-full gap-2 text-base"
					onClick={() => onStartMatching(mode, interests)}
				>
					<Search className="h-5 w-5" />
					Start Matching
				</Button>

				{/* Live counter */}
				<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
					<Users className="h-4 w-4" />
					<span>~{onlineInQueue.toLocaleString()} people matching now</span>
				</div>
			</CardContent>
		</Card>
	);
}
