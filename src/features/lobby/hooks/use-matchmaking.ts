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
	const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const matchedHandledRef = useRef(false);

	const cleanup = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}

		if (pollRef.current) {
			clearInterval(pollRef.current);
			pollRef.current = null;
		}

		if (channelRef.current) {
			supabase.removeChannel(channelRef.current);
			channelRef.current = null;
		}
	}, []);

	const handleMatched = useCallback(
		(roomId: string, partnerId: string) => {
			if (matchedHandledRef.current) return;
			matchedHandledRef.current = true;

			cleanup();

			setState((prev) => ({
				...prev,
				status: "matched",
				roomId,
				partnerId,
			}));

			setTimeout(() => {
				setState((prev) => {
					navigate({
						to: "/chat",
						search: { roomId },
					});
					return { ...prev, status: "navigating" };
				});
			}, 1500);
		},
		[cleanup, navigate],
	);

	const startMatching = useCallback(
		async (interests: string[]) => {
			if (!user) return;

			matchedHandledRef.current = false;

			setState({
				status: "queuing",
				interests,
				elapsedSeconds: 0,
				roomId: null,
				partnerId: null,
				error: null,
			});

			// 1. Subscribe FIRST, wait for SUBSCRIBED ack, so we don't miss the
			//    broadcast if the edge function pairs us before the WS handshake
			//    completes.
			const channel = supabase.channel(`match:${user.id}`);

			channel.on("broadcast", { event: "matched" }, (payload) => {
				const { room_id, partner_id } = payload.payload as {
					room_id: string;
					partner_id: string;
				};
				handleMatched(room_id, partner_id);
			});

			channelRef.current = channel;

			await new Promise<void>((resolve) => {
				channel.subscribe((status) => {
					if (
						status === "SUBSCRIBED" ||
						status === "CHANNEL_ERROR" ||
						status === "TIMED_OUT" ||
						status === "CLOSED"
					) {
						resolve();
					}
				});
			});

			// 2. Only now insert into the queue — channel is live.
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
				cleanup();
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

			// 3. DB poll fallback — if the broadcast is ever missed (dropped
			//    WS frame, service role broadcasting before subscribe, etc.)
			//    we still detect the match by reading our own queue row.
			pollRef.current = setInterval(async () => {
				if (matchedHandledRef.current || !queueEntryIdRef.current) return;
				const { data: row } = await supabase
					.from("match_queue")
					.select("status, room_id, matched_with")
					.eq("id", queueEntryIdRef.current)
					.maybeSingle();
				if (row?.status === "matched" && row.room_id && row.matched_with) {
					handleMatched(row.room_id, row.matched_with);
				}
			}, 2000);

			// 4. Elapsed timer
			timerRef.current = setInterval(() => {
				setState((prev) => ({
					...prev,
					elapsedSeconds: prev.elapsedSeconds + 1,
				}));
			}, 1000);

			// 5. Transition to searching
			setState((prev) => ({ ...prev, status: "searching" }));
		},
		[user, cleanup, handleMatched],
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
