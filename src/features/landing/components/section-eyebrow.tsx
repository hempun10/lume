/**
 * Small uppercase label pill used above section headings to anchor the
 * section with its accent color. Matches the eyebrow treatment used across
 * the landing page so every section reads the same visual language.
 */
export function SectionEyebrow({
	label,
	dotClass = "bg-foreground",
}: {
	label: string;
	/** Tailwind bg-* class for the tiny color dot. */
	dotClass?: string;
}) {
	return (
		<div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1">
			<span className={`size-1.5 rounded-full ${dotClass}`} />
			<p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
				{label}
			</p>
		</div>
	);
}
