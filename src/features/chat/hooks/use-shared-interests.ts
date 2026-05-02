import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth";
import { supabase } from "@/lib/supabase/client";
import { useStrangerProfile } from "./use-stranger-profile";

/**
 * Returns the case-insensitive intersection of the current user's interests
 * and the stranger's interests for the given room.
 *
 * Mirrors the matchmaking scoring logic (see
 * `supabase/functions/match-users/scoring.ts#interestScore`) so the UI
 * surface matches the reason the pair was put together.
 *
 * The returned tags preserve the **current user's** original casing — that's
 * what we display ("You both like Music") so the value reads naturally.
 */
export function useSharedInterests(roomId: string) {
	const { user } = useAuth();
	const userId = user?.id ?? "";

	const { data: stranger } = useStrangerProfile(roomId, userId);

	const { data: myInterests } = useQuery({
		queryKey: ["my-interests", userId],
		enabled: !!userId,
		staleTime: 1000 * 60 * 5,
		queryFn: async () => {
			const { data, error } = await supabase
				.from("profiles")
				.select("interests")
				.eq("id", userId)
				.maybeSingle();
			if (error) throw error;
			return data?.interests ?? [];
		},
	});

	if (!myInterests?.length || !stranger?.interests.length) return [];

	const strangerSet = new Set(
		stranger.interests.map((tag) => tag.toLowerCase().trim()),
	);
	return myInterests.filter((tag) => strangerSet.has(tag.toLowerCase().trim()));
}
