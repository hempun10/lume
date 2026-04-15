import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";

interface AuthInputProps extends ComponentPropsWithoutRef<"input"> {
	/** Lucide icon rendered on the left side of the input. */
	icon: LucideIcon;
}

/**
 * Styled input with a left-side icon, used across all auth & onboarding forms.
 * Wraps a native `<input>` — spread remaining props (type, placeholder, etc.).
 */
export function AuthInput({ icon: Icon, className, ...props }: AuthInputProps) {
	return (
		<div className="flex items-center rounded-lg border border-foreground/10 transition-colors hover:border-foreground/20 focus-within:ring-2 focus-within:ring-ring dark:border-foreground/10">
			<Icon className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
			<input
				className="h-9 w-full bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
				{...props}
			/>
		</div>
	);
}
