import { Sparkles } from "lucide-react";

interface SharedInterestsBannerProps {
	interests: string[];
}

/**
 * Thin strip shown directly under the chat header when the two strangers
 * have at least one interest in common. Renders nothing otherwise.
 *
 * The copy is intentionally explicit ("You both like X · Y") so it doubles
 * as a visible regression target for the realtime-matchmaking test — the
 * pair was scored on interest overlap, and the UI now says so out loud.
 */
export function SharedInterestsBanner({
	interests,
}: SharedInterestsBannerProps) {
	if (!interests.length) return null;

	return (
		<div
			data-testid="shared-interests-banner"
			className="flex shrink-0 items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-1.5 text-xs text-muted-foreground"
		>
			<Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
			<span className="font-medium text-foreground">You both like</span>
			<ul className="flex flex-wrap items-center gap-1">
				{interests.map((tag, i) => (
					<li key={tag} className="flex items-center gap-1">
						<span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
							{tag}
						</span>
						{i < interests.length - 1 && (
							<span aria-hidden="true" className="text-muted-foreground/40">
								·
							</span>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}
