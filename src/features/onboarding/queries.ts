import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

/**
 * Query key factory for profile-related queries.
 * Hierarchical structure: ["profiles"] → ["profiles", userId] → ["profiles", userId, "onboarding"]
 */
export const profileKeys = {
	all: () => ["profiles"] as const,
	detail: (userId: string) => [...profileKeys.all(), userId] as const,
	onboarding: (userId: string) =>
		[...profileKeys.detail(userId), "onboarding"] as const,
};

/**
 * Query options for checking whether a user has completed onboarding.
 * Used in the _authenticated layout loader to gate access to protected routes.
 */
export function profileOnboardingOptions(userId: string) {
	return queryOptions({
		queryKey: profileKeys.onboarding(userId),
		queryFn: async () => {
			const { data, error } = await supabase
				.from("profiles")
				.select("onboarding_completed")
				.eq("id", userId)
				.maybeSingle();

			if (error) throw error;
			return data;
		},
		staleTime: 1000 * 60 * 5, // 5 minutes — rarely changes mid-session
	});
}
