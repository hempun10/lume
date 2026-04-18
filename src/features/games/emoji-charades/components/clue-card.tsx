interface Phrase {
	category: string;
	emojis: string;
	phrase: string;
}

export function ClueCard({
	phrase,
	iAmRevealer,
}: {
	phrase: Phrase;
	iAmRevealer: boolean;
}) {
	return (
		<div className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-muted/30 px-4 py-5">
			<p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
				{phrase.category}
			</p>
			<p className="text-center text-4xl leading-none tracking-wide">
				{phrase.emojis}
			</p>
			{iAmRevealer && (
				<p className="mt-1 text-center text-xs text-muted-foreground">
					Answer:{" "}
					<span className="font-semibold text-foreground">{phrase.phrase}</span>
				</p>
			)}
		</div>
	);
}
