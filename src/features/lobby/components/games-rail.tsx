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
import { GAMES } from "@/features/games/data/games";

const iconMap: Record<string, LucideIcon> = {
	grid: Grid3X3,
	brain: Brain,
	type: Type,
	crown: Crown,
	"circle-dot": CircleDot,
	pencil: Pencil,
};

export function GamesRail() {
	const navigate = useNavigate();

	return (
		<section className="space-y-3 duration-500 animate-in fade-in slide-in-from-bottom-2 [animation-delay:80ms]">
			<div className="flex items-end justify-between">
				<div className="space-y-1">
					<p className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
						Play
					</p>
					<h2 className="font-semibold text-foreground text-lg tracking-tight">
						Games to try
					</h2>
				</div>
				<button
					type="button"
					onClick={() => navigate({ to: "/games" })}
					className="text-muted-foreground text-xs transition-colors duration-150 ease-out hover:text-foreground"
				>
					View all →
				</button>
			</div>

			<div className="-mx-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
				<div className="flex gap-3 md:grid md:grid-cols-3 md:gap-4">
					{GAMES.map((game) => {
						const Icon = iconMap[game.icon] ?? Grid3X3;
						const isAvailable = game.status === "available";
						return (
							<button
								key={game.id}
								type="button"
								onClick={() => navigate({ to: "/games" })}
								disabled={!isAvailable}
								className="group flex min-w-[220px] flex-col gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-[border-color,transform] duration-150 ease-out hover:border-foreground/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-border disabled:active:scale-100 md:min-w-0"
							>
								<div className="flex items-start justify-between">
									<div className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
										<Icon className="size-5" aria-hidden />
									</div>
									{isAvailable ? (
										<span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
											<span
												className="size-1.5 rounded-full bg-emerald-500"
												aria-hidden
											/>
											Playable
										</span>
									) : (
										<Badge variant="secondary" className="text-xs">
											Soon
										</Badge>
									)}
								</div>
								<div className="flex-1 space-y-1">
									<h3 className="font-semibold text-foreground text-sm tracking-tight">
										{game.name}
									</h3>
									<p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed text-pretty">
										{game.description}
									</p>
								</div>
								<div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground tabular-nums">
									<span>{game.players}</span>
									<span aria-hidden className="text-border">
										·
									</span>
									<span>{game.duration}</span>
								</div>
							</button>
						);
					})}
				</div>
			</div>
		</section>
	);
}
