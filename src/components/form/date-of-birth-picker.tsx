import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { MAX_DOB } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { FormInput } from "./form-input";

interface DateOfBirthPickerProps {
	name?: string;
	label?: string;
}

/**
 * Reusable date-of-birth picker using FormInput + Calendar popover.
 * Enforces 18+ age requirement via MAX_DOB.
 * Must be rendered inside a `<Form>` provider.
 */
export function DateOfBirthPicker({
	name = "dateOfBirth",
	label = "Date of birth",
}: DateOfBirthPickerProps) {
	return (
		<FormInput name={name} label={label}>
			{(field) => (
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className={cn(
								"w-full justify-start text-left font-normal",
								!field.value && "text-muted-foreground",
							)}
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{field.value
								? format(new Date(field.value), "MMM d, yyyy")
								: "Pick a date"}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							mode="single"
							selected={field.value ? new Date(field.value) : undefined}
							onSelect={(date) => {
								if (date) {
									field.onChange(format(date, "yyyy-MM-dd"));
								}
							}}
							defaultMonth={MAX_DOB}
							disabled={{ after: MAX_DOB }}
							captionLayout="dropdown"
							fromYear={1920}
							toYear={MAX_DOB.getFullYear()}
						/>
					</PopoverContent>
				</Popover>
			)}
		</FormInput>
	);
}
