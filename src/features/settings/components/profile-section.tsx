import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Check, Globe, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormInput } from "@/components/form/form-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { GENDER_OPTIONS } from "@/features/onboarding/schema";
import { cn } from "@/lib/utils";
import type { ProfileData, ProfileFormValues } from "../types";

const profileSchema = z.object({
	displayName: z
		.string()
		.min(1, "Display name is required")
		.max(50, "Display name must be 50 characters or less"),
	dateOfBirth: z.string().min(1, "Date of birth is required"),
	gender: z.enum(["male", "female", "non-binary", "prefer-not-to-say", ""], {
		message: "Please select a gender",
	}),
	region: z.string().max(100, "Region must be 100 characters or less"),
});

const MAX_DOB = (() => {
	const d = new Date();
	d.setFullYear(d.getFullYear() - 18);
	return d;
})();

interface ProfileSectionProps {
	profile: ProfileData;
	onSave: (data: ProfileFormValues) => Promise<void>;
	isSaving: boolean;
	saveError: string | null;
	saveSuccess: boolean;
}

export function ProfileSection({
	profile,
	onSave,
	isSaving,
	saveError,
	saveSuccess,
}: ProfileSectionProps) {
	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			displayName: profile.display_name ?? "",
			dateOfBirth: profile.date_of_birth ?? "",
			gender: (profile.gender as ProfileFormValues["gender"]) ?? "",
			region: profile.region ?? "",
		},
	});

	return (
		<Card className="p-6">
			<div className="mb-5">
				<h2 className="text-base font-semibold text-foreground">Profile</h2>
				<p className="text-sm text-muted-foreground">
					Your public profile information
				</p>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
					{saveError && (
						<Alert variant="destructive">
							<AlertDescription>{saveError}</AlertDescription>
						</Alert>
					)}

					{saveSuccess && (
						<Alert>
							<Check className="h-4 w-4" />
							<AlertDescription>Profile updated successfully.</AlertDescription>
						</Alert>
					)}

					{/* Display name */}
					<FormInput
						name="displayName"
						label="Display name"
						icon={User}
						placeholder="What should we call you?"
						autoComplete="name"
					/>

					{/* Date of birth and Gender — side by side */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{/* Date of birth — Calendar popover */}
						<FormInput name="dateOfBirth" label="Date of birth">
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

						{/* Gender — shadcn Select */}
						<FormInput name="gender" label="Gender">
							{(field) => (
								<Select
									value={field.value ?? ""}
									onValueChange={field.onChange}
								>
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
					</div>

					{/* Region */}
					<FormInput
						name="region"
						label="Region"
						labelSuffix="(optional)"
						icon={Globe}
						placeholder="e.g. New York, London, Tokyo"
						autoComplete="address-level1"
					/>

					<div className="flex justify-end pt-2">
						<Button type="submit" disabled={isSaving} size="sm">
							{isSaving ? "Saving..." : "Save changes"}
						</Button>
					</div>
				</form>
			</Form>
		</Card>
	);
}
