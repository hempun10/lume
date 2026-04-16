import { useCallback, useRef, useState } from "react";
import type { MatchMode } from "../types";

export type MatchStatus = "idle" | "searching" | "matched";

interface MatchState {
	status: MatchStatus;
	mode: MatchMode;
	interests: string[];
	elapsedSeconds: number;
}

interface UseMatchStateReturn {
	state: MatchState;
	startSearching: (mode: MatchMode, interests: string[]) => void;
	cancelSearching: () => void;
}

const INITIAL_STATE: MatchState = {
	status: "idle",
	mode: "text",
	interests: [],
	elapsedSeconds: 0,
};

/**
 * State machine for the matching flow.
 *
 * idle → searching → matched
 *   ↑       |
 *   └───────┘ (cancel)
 *
 * When searching, a timer ticks every second.
 * TODO: Replace mock matching with Supabase Realtime presence/channels.
 */
export function useMatchState(): UseMatchStateReturn {
	const [state, setState] = useState<MatchState>(INITIAL_STATE);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const clearTimer = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	const startSearching = useCallback(
		(mode: MatchMode, interests: string[]) => {
			clearTimer();

			setState({
				status: "searching",
				mode,
				interests,
				elapsedSeconds: 0,
			});

			timerRef.current = setInterval(() => {
				setState((prev) => ({
					...prev,
					elapsedSeconds: prev.elapsedSeconds + 1,
				}));
			}, 1000);
		},
		[clearTimer],
	);

	const cancelSearching = useCallback(() => {
		clearTimer();
		setState(INITIAL_STATE);
	}, [clearTimer]);

	return { state, startSearching, cancelSearching };
}
