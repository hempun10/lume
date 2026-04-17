import type { GenderValue } from "@/features/onboarding/schema";

export interface ProfileData {
	display_name: string | null;
	date_of_birth: string | null;
	gender: string | null;
	region: string | null;
	interests: string[] | null;
}

export interface ProfileFormValues {
	displayName: string;
	dateOfBirth: string;
	gender: GenderValue | "";
	region: string;
}

export interface PreferencesFormValues {
	interests: string[];
}
