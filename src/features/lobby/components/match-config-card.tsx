import { Search, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { InterestInput } from "./interest-input";

interface MatchConfigCardProps {
	defaultInterests?: string[];
	onStartMatching: (interests: string[]) => void;
}

export function MatchConfigCard({
	defaultInterests = [],
	onStartMatching,
}: MatchConfigCardProps) {
	const [interests, setInterests] = useState<string[]>(defaultInterests);

	// Mock online count — will be replaced by real Supabase presence data
	const onlineInQueue = 342;

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Find a Match</CardTitle>
				<CardDescription>
					Connect with a stranger who shares your interests
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Interests */}
				<div className="space-y-2">
					<p className="text-sm font-medium text-foreground">Interests</p>
					<InterestInput interests={interests} onChange={setInterests} />
					<p className="text-xs text-muted-foreground">
						Pre-filled from your profile. Add more to find better matches.
					</p>
				</div>

				{/* Start button */}
				<Button
					size="lg"
					className="w-full gap-2 text-base"
					onClick={() => onStartMatching(interests)}
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
