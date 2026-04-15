import { supabase } from "@/lib/supabase/client";
import type { OnboardingFormValues } from "./schema";

/** Persist onboarding profile data and mark onboarding as complete. */
export async function completeOnboarding({
	userId,
	data,
}: {
	userId: string;
	data: OnboardingFormValues;
}) {
	const { error } = await supabase
		.from("profiles")
		.update({
			display_name: data.displayName,
			date_of_birth: data.dateOfBirth,
			gender: data.gender,
			region: data.region || null,
			interests: data.interests,
			onboarding_completed: true,
		})
		.eq("id", userId);

	if (error) throw error;
}
