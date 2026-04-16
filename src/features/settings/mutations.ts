import { supabase } from "@/lib/supabase/client";
import type { PreferencesFormValues, ProfileFormValues } from "./types";

/** Update profile fields (display name, DOB, gender, region). */
export async function updateProfile({
	userId,
	data,
}: {
	userId: string;
	data: ProfileFormValues;
}) {
	const { error } = await supabase
		.from("profiles")
		.update({
			display_name: data.displayName,
			date_of_birth: data.dateOfBirth || null,
			gender: data.gender || null,
			region: data.region || null,
		})
		.eq("id", userId);

	if (error) throw error;
}

/** Update matching preferences (interests). */
export async function updatePreferences({
	userId,
	data,
}: {
	userId: string;
	data: PreferencesFormValues;
}) {
	const { error } = await supabase
		.from("profiles")
		.update({
			interests: data.interests,
		})
		.eq("id", userId);

	if (error) throw error;
}
