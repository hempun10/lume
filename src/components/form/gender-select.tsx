import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { GENDER_OPTIONS } from "@/features/onboarding/schema";
import { FormInput } from "./form-input";

interface GenderSelectProps {
	name?: string;
	label?: string;
}

/**
 * Reusable gender select using FormInput + shadcn Select.
 * Must be rendered inside a `<Form>` provider.
 */
export function GenderSelect({
	name = "gender",
	label = "Gender",
}: GenderSelectProps) {
	return (
		<FormInput name={name} label={label}>
			{(field) => (
				<Select value={field.value ?? ""} onValueChange={field.onChange}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select gender" />
					</SelectTrigger>
					<SelectContent>
						{GENDER_OPTIONS.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)}
		</FormInput>
	);
}
