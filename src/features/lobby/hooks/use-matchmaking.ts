import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/features/auth";
import { supabase } from "@/lib/supabase/client";

export type MatchStatus =
	| "idle"
	| "queuing"
	| "searching"
	| "matched"
	| "navigating";

interface MatchState {
	status: MatchStatus;
	interests: string[];
	elapsedSeconds: number;
	roomId: string | null;
	partnerId: string | null;
	error: string | null;
}

interface UseMatchmakingReturn {
	state: MatchState;
	startMatching: (interests: string[]) => void;
	cancelMatching: () => void;
}

const INITIAL_STATE: MatchState = {
	status: "idle",
	interests: [],
	elapsedSeconds: 0,
	roomId: null,
	partnerId: null,
	error: null,
};

/**
 * Real matchmaking hook using Supabase match_queue + Broadcast.
 *
 * Flow:
 * 1. INSERT into match_queue → status becomes "searching"
 * 2. Subscribe to Broadcast channel `match:{userId}` for match notification
 * 3. Edge Function pairs users using multi-factor scoring (interests, gender, age, region)
 * 4. On match → navigate to /chat?roomId={roomId}
 */
export function useMatchmaking(): UseMatchmakingReturn {
	const [state, setState] = useState<MatchState>(INITIAL_STATE);
	const { user } = useAuth();
	const navigate = useNavigate();

	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
	const queueEntryIdRef = useRef<string | null>(null);

	const cleanup = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}

		if (channelRef.current) {
			supabase.removeChannel(channelRef.current);
			channelRef.current = null;
		}
	}, []);

	const startMatching = useCallback(
		async (interests: string[]) => {
			if (!user) return;

			setState({
				status: "queuing",
				interests,
				elapsedSeconds: 0,
				roomId: null,
				partnerId: null,
				error: null,
			});

			// 1. Insert into match_queue (mode defaults to 'text' for backward compat)
			const { data, error } = await supabase
				.from("match_queue")
				.insert({
					user_id: user.id,
					mode: "text",
					interests,
					status: "waiting",
				})
				.select("id")
				.single();

			if (error) {
				if (error.code === "23505") {
					setState((prev) => ({
						...prev,
						status: "idle",
						error: "You already have an active search. Please wait.",
					}));
				} else {
					setState((prev) => ({
						...prev,
						status: "idle",
						error: `Failed to join queue: ${error.message}`,
					}));
				}
				return;
			}

			queueEntryIdRef.current = data.id;

			// 2. Subscribe to personal match channel for notifications
			const channel = supabase.channel(`match:${user.id}`);

			channel
				.on("broadcast", { event: "matched" }, (payload) => {
					const { room_id, partner_id } = payload.payload as {
						room_id: string;
						partner_id: string;
					};

					cleanup();

					setState((prev) => ({
						...prev,
						status: "matched",
						roomId: room_id,
						partnerId: partner_id,
					}));

					// Brief delay to show "matched" state, then navigate
					setTimeout(() => {
						setState((prev) => {
							navigate({
								to: "/chat",
								search: { roomId: room_id },
							});
							return { ...prev, status: "navigating" };
						});
					}, 1500);
				})
				.subscribe();

			channelRef.current = channel;

			// 3. Start elapsed timer
			timerRef.current = setInterval(() => {
				setState((prev) => ({
					...prev,
					elapsedSeconds: prev.elapsedSeconds + 1,
				}));
			}, 1000);

			// 4. Transition to searching
			setState((prev) => ({ ...prev, status: "searching" }));
		},
		[user, cleanup, navigate],
	);

	const cancelMatching = useCallback(async () => {
		cleanup();

		if (queueEntryIdRef.current) {
			await supabase
				.from("match_queue")
				.update({ status: "cancelled" })
				.eq("id", queueEntryIdRef.current);
			queueEntryIdRef.current = null;
		}

		setState(INITIAL_STATE);
	}, [cleanup]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			cleanup();

			if (queueEntryIdRef.current) {
				supabase
					.from("match_queue")
					.update({ status: "cancelled" })
					.eq("id", queueEntryIdRef.current)
					.then(() => {
						queueEntryIdRef.current = null;
					});
			}
		};
	}, [cleanup]);

	return { state, startMatching, cancelMatching };
}
