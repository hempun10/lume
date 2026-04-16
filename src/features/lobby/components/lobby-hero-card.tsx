import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Gamepad2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { INTEREST_OPTIONS } from "@/features/onboarding/schema";
import { cn } from "@/lib/utils";
import { useOnlineCount } from "../hooks/use-online-count";

type MatchMode = "chat" | "games";

interface LobbyHeroCardProps {
	defaultInterests: string[];
	onStartMatching: (interests: string[]) => void;
}

const MAX_INTERESTS = 5;

export function LobbyHeroCard({
	defaultInterests,
	onStartMatching,
}: LobbyHeroCardProps) {
	const [mode, setMode] = useState<MatchMode>("chat");
	const [interests, setInterests] = useState<string[]>(
		defaultInterests.slice(0, MAX_INTERESTS),
	);
	const navigate = useNavigate();
	const onlineCount = useOnlineCount();

	function toggleInterest(interest: string) {
		setInterests((prev) => {
			if (prev.includes(interest)) {
				return prev.filter((i) => i !== interest);
			}
			if (prev.length >= MAX_INTERESTS) return prev;
			return [...prev, interest];
		});
	}

	function handleStart() {
		if (mode === "games") {
			navigate({ to: "/games" });
			return;
		}
		onStartMatching(interests);
	}

	return (
		<section
			aria-label="Start matching"
			className="rounded-3xl border border-border bg-card p-6 duration-500 animate-in fade-in slide-in-from-bottom-2 md:p-8"
		>
			<div className="flex flex-col gap-7">
				<header className="flex items-start justify-between gap-4">
					<div className="space-y-2">
						<p className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
							Match
						</p>
						<h2 className="text-balance font-semibold text-2xl text-foreground tracking-tight md:text-3xl">
							Meet someone new
						</h2>
					</div>

					<div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
						<span
							className="size-1.5 rounded-full bg-emerald-500"
							aria-hidden
						/>
						<span className="font-mono text-foreground text-xs tabular-nums">
							{onlineCount.toLocaleString()}
						</span>
						<span className="text-muted-foreground text-xs">online</span>
					</div>
				</header>

				<ToggleGroup
					type="single"
					value={mode}
					onValueChange={(value) => {
						if (value) setMode(value as MatchMode);
					}}
					className="grid w-full grid-cols-2 rounded-xl bg-muted p-1"
					aria-label="Match mode"
				>
					<ToggleGroupItem
						value="chat"
						className="gap-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
					>
						<MessageCircle className="size-4" />
						Text Chat
					</ToggleGroupItem>
					<ToggleGroupItem
						value="games"
						className="gap-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
					>
						<Gamepad2 className="size-4" />
						Games
					</ToggleGroupItem>
				</ToggleGroup>

				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<p className="font-medium text-foreground text-sm">
							What&rsquo;s the vibe?
						</p>
						<p className="font-mono text-muted-foreground text-xs tabular-nums">
							{interests.length}/{MAX_INTERESTS}
						</p>
					</div>
					<div className="flex flex-wrap gap-1.5">
						{INTEREST_OPTIONS.map((option) => {
							const active = interests.includes(option);
							const atMax = !active && interests.length >= MAX_INTERESTS;
							return (
								<button
									key={option}
									type="button"
									onClick={() => toggleInterest(option)}
									disabled={atMax}
									aria-pressed={active}
									className={cn(
										"rounded-full border px-3 py-1 font-medium text-xs transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.97]",
										active
											? "border-foreground bg-foreground text-background"
											: "border-border bg-background text-foreground hover:border-foreground/50",
										atMax && "cursor-not-allowed opacity-40 active:scale-100",
									)}
								>
									{option}
								</button>
							);
						})}
					</div>
					{interests.length === 0 && (
						<p className="text-muted-foreground text-xs text-pretty">
							Skip for random matching, or pick a few to find your people.
						</p>
					)}
				</div>

				<Button
					size="lg"
					className="group h-12 w-full gap-2 text-base transition-transform duration-150 ease-out active:scale-[0.98]"
					onClick={handleStart}
				>
					{mode === "chat" ? "Start matching" : "Browse games"}
					<ArrowRight
						className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
						aria-hidden
					/>
				</Button>
			</div>
		</section>
	);
}
