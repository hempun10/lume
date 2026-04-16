import { GAMES } from "../data/games";
import { GameCard } from "./game-card";

export function GamesView() {
	const available = GAMES.filter((g) => g.status === "available");
	const comingSoon = GAMES.filter((g) => g.status !== "available");

	return (
		<div className="mx-auto w-full max-w-5xl space-y-10 px-4 py-6 md:px-6 md:py-10">
			<div className="space-y-2 duration-500 animate-in fade-in slide-in-from-bottom-2">
				<p className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
					Catalog
				</p>
				<h1 className="text-balance font-semibold text-3xl text-foreground tracking-tight md:text-4xl">
					Games
				</h1>
				<p className="text-pretty text-muted-foreground md:text-base">
					Play with a stranger. Matching starts the moment you pick.
				</p>
			</div>

			{available.length > 0 && (
				<section className="space-y-3">
					<h2 className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
						Playable now
					</h2>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{available.map((game) => (
							<GameCard key={game.id} game={game} />
						))}
					</div>
				</section>
			)}

			{comingSoon.length > 0 && (
				<section className="space-y-3">
					<h2 className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
						Coming soon
					</h2>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{comingSoon.map((game) => (
							<GameCard key={game.id} game={game} />
						))}
					</div>
				</section>
			)}
		</div>
	);
}
