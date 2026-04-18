import { useEffect, useRef, useState } from "react";
import {
	DRAW_AND_GUESS_ROUND_DURATION_MS,
	type DrawAndGuessPick,
} from "../../engines/draw-and-guess";
import { playTickPulse, playTimeoutBuzz } from "../../utils/sounds";
import { WORD_REVEAL_MS } from "../constants";

/**
 * Round-level side-effects for the Draw & Guess board:
 * - countdown timer that resets per round
 * - drawer-side auto-reveal on timeout or when guesser locks in
 * - guesser-side audio cues (tick pulses + timeout buzz)
 * - drawer-side word-reveal overlay that fades after WORD_REVEAL_MS
 */
export function useRoundTimer({
	round,
	revealed,
	iAmDrawer,
	locked,
	guess,
	correctIdxForDrawer,
	targetWord,
	onReveal,
}: {
	round: number;
	revealed: boolean;
	iAmDrawer: boolean;
	locked: boolean;
	guess: DrawAndGuessPick | null;
	correctIdxForDrawer: DrawAndGuessPick | null;
	targetWord: string | null;
	onReveal: () => void;
}) {
	// Countdown timer. Resets when round changes; stops at 0.
	const [remaining, setRemaining] = useState(DRAW_AND_GUESS_ROUND_DURATION_MS);
	// biome-ignore lint/correctness/useExhaustiveDependencies: `round` is the intentional reset key.
	useEffect(() => {
		if (revealed) return;
		setRemaining(DRAW_AND_GUESS_ROUND_DURATION_MS);
		const start = Date.now();
		const id = setInterval(() => {
			const left = Math.max(
				0,
				DRAW_AND_GUESS_ROUND_DURATION_MS - (Date.now() - start),
			);
			setRemaining(left);
			if (left === 0) clearInterval(id);
		}, 250);
		return () => clearInterval(id);
	}, [round, revealed]);

	// Auto-reveal on timeout (drawer only — they own the answer).
	const autoRevealedRef = useRef(false);
	useEffect(() => {
		if (revealed) autoRevealedRef.current = false;
	}, [revealed]);
	useEffect(() => {
		if (
			!revealed &&
			remaining === 0 &&
			iAmDrawer &&
			correctIdxForDrawer !== null &&
			!autoRevealedRef.current
		) {
			autoRevealedRef.current = true;
			onReveal();
		}
	}, [remaining, revealed, iAmDrawer, correctIdxForDrawer, onReveal]);

	// Also reveal immediately when guesser locks in (drawer's side).
	useEffect(() => {
		if (
			!revealed &&
			guess !== null &&
			iAmDrawer &&
			correctIdxForDrawer !== null &&
			!autoRevealedRef.current
		) {
			autoRevealedRef.current = true;
			onReveal();
		}
	}, [guess, revealed, iAmDrawer, correctIdxForDrawer, onReveal]);

	// Guesser-only audio cues: a short pulse for each of the final
	// 10 seconds, and a low buzz when the timer hits zero without a
	// guess. Tracked via a ref so we fire once per second boundary.
	const lastPulseSecondRef = useRef<number | null>(null);
	const timeoutBuzzedRef = useRef(false);
	useEffect(() => {
		if (revealed) {
			lastPulseSecondRef.current = null;
			timeoutBuzzedRef.current = false;
			return;
		}
		if (iAmDrawer || locked) return;
		const seconds = Math.ceil(remaining / 1000);
		if (seconds > 0 && seconds <= 10) {
			if (lastPulseSecondRef.current !== seconds) {
				lastPulseSecondRef.current = seconds;
				playTickPulse();
			}
		}
		if (remaining === 0 && !timeoutBuzzedRef.current) {
			timeoutBuzzedRef.current = true;
			playTimeoutBuzz();
		}
	}, [remaining, revealed, iAmDrawer, locked]);

	// Word-reveal overlay for the drawer: briefly show the target
	// word centered over the canvas at the start of the round, then
	// fade out. Guesser never sees this.
	const [showWordOverlay, setShowWordOverlay] = useState(false);
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional round reset.
	useEffect(() => {
		if (!iAmDrawer || !targetWord || revealed) {
			setShowWordOverlay(false);
			return;
		}
		setShowWordOverlay(true);
		const id = window.setTimeout(
			() => setShowWordOverlay(false),
			WORD_REVEAL_MS,
		);
		return () => window.clearTimeout(id);
	}, [round, iAmDrawer, targetWord]);

	return { remaining, showWordOverlay };
}
