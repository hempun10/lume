import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface FieldPasswordProps<T extends FieldValues> {
	control: Control<T>;
	name: FieldPath<T>;
	label: string;
	placeholder?: string;
	autoComplete?: string;
	disabled?: boolean;
}

export function FieldPassword<T extends FieldValues>({
	control,
	name,
	label,
	placeholder,
	autoComplete,
	disabled,
}: FieldPasswordProps<T>) {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{label}</FormLabel>
					<FormControl>
						<div className="relative">
							<Input
								type={showPassword ? "text" : "password"}
								placeholder={placeholder}
								autoComplete={autoComplete}
								disabled={disabled}
								className="pr-10"
								{...field}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
								aria-label={showPassword ? "Hide password" : "Show password"}
							>
								{showPassword ? (
									<EyeOff className="size-4" />
								) : (
									<Eye className="size-4" />
								)}
							</button>
						</div>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
