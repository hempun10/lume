import { useCallback, useRef, useState } from "react";

export type MatchStatus = "idle" | "searching" | "matched";

interface MatchState {
	status: MatchStatus;
	interests: string[];
	elapsedSeconds: number;
}

interface UseMatchStateReturn {
	state: MatchState;
	startSearching: (interests: string[]) => void;
	cancelSearching: () => void;
}

const INITIAL_STATE: MatchState = {
	status: "idle",
	interests: [],
	elapsedSeconds: 0,
};

/**
 * State machine for the matching flow (mock version).
 *
 * idle → searching → matched
 *   ↑       |
 *   └───────┘ (cancel)
 *
 * Superseded by useMatchmaking hook for real matching.
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
		(interests: string[]) => {
			clearTimer();

			setState({
				status: "searching",
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
