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
	const { data: updated, error } = await supabase
		.from("profiles")
		.update({
			display_name: data.displayName,
			date_of_birth: data.dateOfBirth || null,
			gender: data.gender || null,
			region: data.region || null,
		})
		.eq("id", userId)
		.select("id")
		.single();

	if (error) throw error;
	if (!updated) {
		throw new Error(
			"Profile update returned no rows — check RLS policies on profiles.",
		);
	}

	// Keep auth.user_metadata.display_name in sync so UIs that read from the
	// session user (e.g. the dashboard greeting) reflect the change immediately.
	const { error: authError } = await supabase.auth.updateUser({
		data: { display_name: data.displayName },
	});
	if (authError) throw authError;
}

/** Update matching preferences (interests). */
export async function updatePreferences({
	userId,
	data,
}: {
	userId: string;
	data: PreferencesFormValues;
}) {
	const { data: updated, error } = await supabase
		.from("profiles")
		.update({
			interests: data.interests,
		})
		.eq("id", userId)
		.select("id")
		.single();

	if (error) throw error;
	if (!updated) {
		throw new Error(
			"Preferences update returned no rows — check RLS policies on profiles.",
		);
	}
}
