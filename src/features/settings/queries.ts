import { queryOptions } from "@tanstack/react-query";
import { profileKeys } from "@/features/onboarding/queries";
import { supabase } from "@/lib/supabase/client";

/**
 * Query options for fetching the full user profile for settings.
 * Reuses the profileKeys factory from onboarding for cache coherence.
 */
export function profileDetailOptions(userId: string) {
	return queryOptions({
		queryKey: profileKeys.detail(userId),
		queryFn: async () => {
			const { data, error } = await supabase
				.from("profiles")
				.select("display_name, date_of_birth, gender, region, interests")
				.eq("id", userId)
				.single();

			if (error) throw error;
			return data;
		},
		staleTime: 1000 * 60 * 5,
	});
}
