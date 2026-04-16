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
import type { Game } from "../../games/types";

const iconMap: Record<string, LucideIcon> = {
	grid: Grid3X3,
	brain: Brain,
	type: Type,
	crown: Crown,
	"circle-dot": CircleDot,
	pencil: Pencil,
};

interface GamePickerCardProps {
	game: Game;
	onPlay?: () => void;
}

export function GamePickerCard({ game, onPlay }: GamePickerCardProps) {
	const Icon = iconMap[game.icon] ?? Grid3X3;
	const isAvailable = game.status === "available";

	return (
		<div className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
			<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
				<Icon className="h-4 w-4" />
			</div>
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium text-foreground">{game.name}</p>
				<p className="text-xs text-muted-foreground truncate">
					{game.duration}
				</p>
			</div>
			{isAvailable ? (
				<Button
					size="sm"
					variant="default"
					onClick={onPlay}
					className="h-7 px-3 text-xs"
				>
					Play
				</Button>
			) : (
				<Badge variant="secondary" className="text-[10px] shrink-0">
					Soon
				</Badge>
			)}
		</div>
	);
}
