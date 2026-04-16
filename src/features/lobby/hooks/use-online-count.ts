import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth";
import { supabase } from "@/lib/supabase/client";

const PRESENCE_CHANNEL = "lume:lobby-presence";

/**
 * Tracks how many users are currently present in the lobby via Supabase Presence.
 * Every authenticated user who opens the lobby joins the shared presence channel
 * keyed by their user id, so the count is deduplicated across tabs.
 */
export function useOnlineCount(): number {
	const { user } = useAuth();
	const [count, setCount] = useState(0);

	useEffect(() => {
		if (!user) return;

		const channel = supabase.channel(PRESENCE_CHANNEL, {
			config: { presence: { key: user.id } },
		});

		channel
			.on("presence", { event: "sync" }, () => {
				const state = channel.presenceState();
				setCount(Object.keys(state).length);
			})
			.subscribe(async (status) => {
				if (status === "SUBSCRIBED") {
					await channel.track({ online_at: new Date().toISOString() });
				}
			});

		return () => {
			supabase.removeChannel(channel);
		};
	}, [user]);

	return count;
}
