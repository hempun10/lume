import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Globe, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { DateOfBirthPicker } from "@/components/form/date-of-birth-picker";
import { FormInput } from "@/components/form/form-input";
import { GenderSelect } from "@/components/form/gender-select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { profileSchema } from "../schema";
import type { ProfileData, ProfileFormValues } from "../types";

interface ProfileSectionProps {
	profile: ProfileData;
	onSave: (data: ProfileFormValues) => void;
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
						<DateOfBirthPicker />
						<GenderSelect />
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
