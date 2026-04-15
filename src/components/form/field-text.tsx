import type { Control, FieldPath, FieldValues } from "react-hook-form";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface FieldTextProps<T extends FieldValues> {
	control: Control<T>;
	name: FieldPath<T>;
	label: string;
	placeholder?: string;
	type?: string;
	autoComplete?: string;
	disabled?: boolean;
}

export function FieldText<T extends FieldValues>({
	control,
	name,
	label,
	placeholder,
	type = "text",
	autoComplete,
	disabled,
}: FieldTextProps<T>) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{label}</FormLabel>
					<FormControl>
						<Input
							type={type}
							placeholder={placeholder}
							autoComplete={autoComplete}
							disabled={disabled}
							{...field}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
