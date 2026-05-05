import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface InterestTagSelectorProps {
	options: readonly string[];
	selected: string[];
	onChange: (selected: string[]) => void;
	max?: number;
}

/**
 * Toggleable tag chip grid for selecting interests.
 * Shows a clear indicator (X badge) on selected chips.
 */
export function InterestTagSelector({
	options,
	selected,
	onChange,
	max = 8,
}: InterestTagSelectorProps) {
	function toggle(interest: string) {
		if (selected.includes(interest)) {
			onChange(selected.filter((i) => i !== interest));
		} else if (selected.length < max) {
			onChange([...selected, interest]);
		}
	}

	return (
		<div className="flex flex-wrap gap-2">
			{options.map((interest) => {
				const isSelected = selected.includes(interest);
				const isDisabled = !isSelected && selected.length >= max;

				return (
					<button
						key={interest}
						type="button"
						onClick={() => toggle(interest)}
						disabled={isDisabled}
						aria-pressed={isSelected}
						className={cn(
							"inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
							isSelected
								? "border-primary bg-primary text-primary-foreground"
								: "border-foreground/10 bg-transparent text-muted-foreground hover:border-foreground/20 hover:text-foreground",
							isDisabled && "cursor-not-allowed opacity-40",
						)}
					>
						{interest}
						{isSelected && <X className="h-3 w-3" />}
					</button>
				);
			})}
		</div>
	);
}
