import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

interface StrangerProfile {
	displayName: string | null;
	interests: string[];
}

async function fetchStrangerProfile(
	roomId: string,
	userId: string,
): Promise<StrangerProfile | null> {
	// Get the room to find the stranger's user ID
	const { data: room, error: roomError } = await supabase
		.from("rooms")
		.select("user_a, user_b")
		.eq("id", roomId)
		.single();

	if (roomError || !room) return null;

	const strangerId = room.user_a === userId ? room.user_b : room.user_a;

	// Fetch the stranger's profile
	const { data: profile, error: profileError } = await supabase
		.from("profiles")
		.select("display_name, interests")
		.eq("id", strangerId)
		.single();

	if (profileError || !profile) return null;

	return {
		displayName: profile.display_name,
		interests: profile.interests ?? [],
	};
}

export function useStrangerProfile(roomId: string, userId: string) {
	return useQuery({
		queryKey: ["stranger-profile", roomId],
		queryFn: () => fetchStrangerProfile(roomId, userId),
		enabled: !!roomId && !!userId,
		staleTime: Number.POSITIVE_INFINITY,
	});
}
