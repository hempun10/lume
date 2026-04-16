import { useNavigate } from "@tanstack/react-router";
import {
	Brain,
	CircleDot,
	Crown,
	Grid3X3,
	type LucideIcon,
	Pencil,
	Type,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { setPendingGame } from "../data/pending-game";
import type { Game } from "../types";

const iconMap: Record<string, LucideIcon> = {
	grid: Grid3X3,
	brain: Brain,
	type: Type,
	crown: Crown,
	"circle-dot": CircleDot,
	pencil: Pencil,
};

interface GameCardProps {
	game: Game;
	onPlay?: () => void;
}

export function GameCard({ game, onPlay }: GameCardProps) {
	const Icon = iconMap[game.icon] ?? Grid3X3;
	const isAvailable = game.status === "available";
	const navigate = useNavigate();

	function handlePlay() {
		if (onPlay) {
			onPlay();
			return;
		}
		setPendingGame(game.id);
		navigate({ to: "/dashboard", search: { play: game.id } });
	}

	return (
		<Card className="flex flex-col gap-4 p-5">
			<div className="flex items-start justify-between">
				<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
					<Icon className="h-5 w-5" />
				</div>
				{!isAvailable && (
					<Badge variant="secondary" className="text-xs">
						Coming Soon
					</Badge>
				)}
			</div>

			<div className="flex flex-1 flex-col gap-1.5">
				<h3 className="text-sm font-semibold text-foreground">{game.name}</h3>
				<p className="text-xs leading-relaxed text-muted-foreground">
					{game.description}
				</p>
			</div>

			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3 text-xs text-muted-foreground">
					<span>{game.players}</span>
					<span className="text-border">|</span>
					<span>{game.duration}</span>
				</div>
				<Button
					size="sm"
					variant={isAvailable ? "default" : "outline"}
					disabled={!isAvailable}
					onClick={handlePlay}
					className="h-8 px-3 text-xs"
				>
					{isAvailable ? "Play" : "Soon"}
				</Button>
			</div>
		</Card>
	);
}
