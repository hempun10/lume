import { Check } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { INTEREST_OPTIONS, InterestTagSelector } from "@/features/onboarding";
import type { PreferencesFormValues, ProfileData } from "../types";

interface PreferencesSectionProps {
	profile: ProfileData;
	onSave: (data: PreferencesFormValues) => void;
	isSaving: boolean;
	saveError: string | null;
	saveSuccess: boolean;
}

export function PreferencesSection({
	profile,
	onSave,
	isSaving,
	saveError,
	saveSuccess,
}: PreferencesSectionProps) {
	const [interests, setInterests] = useState<string[]>(profile.interests ?? []);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		onSave({ interests });
	}

	return (
		<Card className="p-6">
			<div className="mb-5">
				<h2 className="text-base font-semibold text-foreground">
					Matching Preferences
				</h2>
				<p className="text-sm text-muted-foreground">
					Choose interests to help us match you with like-minded people
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				{saveError && (
					<Alert variant="destructive">
						<AlertDescription>{saveError}</AlertDescription>
					</Alert>
				)}

				{saveSuccess && (
					<Alert>
						<Check className="h-4 w-4" />
						<AlertDescription>
							Preferences updated successfully.
						</AlertDescription>
					</Alert>
				)}

				<fieldset>
					<legend className="mb-2 text-sm font-medium text-foreground">
						Interests
					</legend>
					<p className="mb-3 text-xs text-muted-foreground">
						Pick 1-8 topics you enjoy
					</p>
					<InterestTagSelector
						options={INTEREST_OPTIONS}
						selected={interests}
						onChange={setInterests}
						max={8}
					/>
				</fieldset>

				<div className="flex justify-end pt-2">
					<Button
						type="submit"
						disabled={isSaving || interests.length === 0}
						size="sm"
					>
						{isSaving ? "Saving..." : "Save preferences"}
					</Button>
				</div>
			</form>
		</Card>
	);
}
