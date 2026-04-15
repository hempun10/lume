import { Gamepad2 } from "lucide-react";
import { GAMES } from "../data/games";
import { GameCard } from "./game-card";

export function GamesView() {
	const availableGames = GAMES.filter((g) => g.status === "available");
	const comingSoonGames = GAMES.filter((g) => g.status === "coming_soon");

	return (
		<div className="mx-auto max-w-4xl px-6 py-8">
			{/* Header */}
			<div className="mb-8 flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
					<Gamepad2 className="h-5 w-5" />
				</div>
				<div>
					<h1 className="text-xl font-semibold text-foreground">Games</h1>
					<p className="text-sm text-muted-foreground">
						Play games with strangers while you chat
					</p>
				</div>
			</div>

			{/* Available Games */}
			<section className="mb-10">
				<h2 className="mb-4 text-sm font-medium text-muted-foreground">
					Available ({availableGames.length})
				</h2>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{availableGames.map((game) => (
						<GameCard key={game.id} game={game} />
					))}
				</div>
			</section>

			{/* Coming Soon */}
			{comingSoonGames.length > 0 && (
				<section>
					<h2 className="mb-4 text-sm font-medium text-muted-foreground">
						Coming Soon ({comingSoonGames.length})
					</h2>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{comingSoonGames.map((game) => (
							<GameCard key={game.id} game={game} />
						))}
					</div>
				</section>
			)}
		</div>
	);
}
