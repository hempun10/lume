export function ScoreBar({
	myWins,
	theirWins,
	threshold,
}: {
	myWins: number;
	theirWins: number;
	threshold: number;
}) {
	return (
		<div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
			<span className="font-medium text-foreground tabular-nums">
				You {myWins}
			</span>
			<span className="text-border">vs</span>
			<span className="tabular-nums">Stranger {theirWins}</span>
			<span className="text-border">·</span>
			<span className="tabular-nums">first to {threshold}</span>
		</div>
	);
}
