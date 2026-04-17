import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Small section badge used above headings. A rounded-rectangle color chip +
 * label + chevron, matching the UserJot-style section marker in the brief.
 *
 * Replaces the older dot-pill eyebrow. The chip color anchors each section
 * with its accent so the page stays scannable.
 */
export function SectionBadge({
	label,
	chipClass = "bg-foreground",
}: {
	label: string;
	/** Tailwind bg-* class (optionally with a dark-mode variant) for the chip. */
	chipClass?: string;
}) {
	return (
		<div className="inline-flex items-center gap-2.5">
			<span className={cn("h-2 w-4 rounded-full", chipClass)} />
			<span className="text-sm font-semibold text-foreground">{label}</span>
			<ChevronRight
				className="size-4 text-muted-foreground"
				strokeWidth={2.5}
			/>
		</div>
	);
}
