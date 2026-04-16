import { Link } from "@tanstack/react-router";
import { MapPin, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface YourVibeCardProps {
	displayName: string;
	interests: string[];
	region?: string | null;
}

export function YourVibeCard({
	displayName,
	interests,
	region,
}: YourVibeCardProps) {
	const hasInterests = interests.length > 0;

	return (
		<section className="rounded-2xl border border-border bg-card p-5 duration-500 animate-in fade-in slide-in-from-bottom-2 [animation-delay:160ms]">
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0 flex-1 space-y-2">
					<div className="flex items-center gap-2">
						<p className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
							Your vibe
						</p>
						{region && (
							<>
								<span className="text-border" aria-hidden>
									·
								</span>
								<span className="flex items-center gap-1 text-muted-foreground text-xs">
									<MapPin className="size-3" aria-hidden />
									{region}
								</span>
							</>
						)}
					</div>

					<p className="truncate text-muted-foreground text-xs">
						Showing as{" "}
						<span className="font-medium text-foreground">{displayName}</span>
					</p>

					<div className="flex flex-wrap gap-1.5 pt-1">
						{hasInterests ? (
							interests.map((interest) => (
								<Badge
									key={interest}
									variant="outline"
									className="border-border text-xs"
								>
									{interest}
								</Badge>
							))
						) : (
							<p className="text-muted-foreground text-xs italic text-pretty">
								No interests set — add a few to match better.
							</p>
						)}
					</div>
				</div>

				<Link
					to="/settings"
					aria-label="Edit your profile"
					className="flex shrink-0 items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-foreground text-xs transition-[background-color,border-color,transform] duration-150 ease-out hover:border-foreground/30 hover:bg-accent active:scale-[0.97]"
				>
					<Pencil className="size-3" aria-hidden />
					Edit
				</Link>
			</div>
		</section>
	);
}
