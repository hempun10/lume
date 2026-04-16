interface LobbyGreetingProps {
	displayName: string;
}

function getTimeBasedGreeting(): { heading: string; subtitle: string } {
	const hour = new Date().getHours();

	if (hour >= 5 && hour < 12) {
		return {
			heading: "Good morning",
			subtitle: "Who's gonna fuel your day today?",
		};
	}
	if (hour >= 12 && hour < 17) {
		return {
			heading: "Good afternoon",
			subtitle: "Perfect time for a quick chat or game.",
		};
	}
	if (hour >= 17 && hour < 22) {
		return {
			heading: "Good evening",
			subtitle: "Wind down with someone new.",
		};
	}
	return {
		heading: "Late night energy",
		subtitle: "The best convos happen at 2 AM — let's find one.",
	};
}

export function LobbyGreeting({ displayName }: LobbyGreetingProps) {
	const { heading, subtitle } = getTimeBasedGreeting();
	const firstName = displayName.split(" ")[0];

	return (
		<div className="space-y-1.5 duration-500 animate-in fade-in slide-in-from-bottom-2">
			<h1 className="text-balance font-semibold text-3xl text-foreground tracking-tight md:text-4xl">
				{heading}, {firstName}.
			</h1>
			<p className="text-pretty text-muted-foreground md:text-base">
				{subtitle}
			</p>
		</div>
	);
}
