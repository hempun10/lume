import { useEffect, useRef } from "react";

/**
 * Draw & Guess's custom events (`stroke_*`, `fill`, `clear`, `undo`)
 * carry drawing data that can only be applied to this board's local
 * canvas refs — not to the shared game state. The adapter-level
 * `getCustomEvents(setGameState)` pattern doesn't fit.
 *
 * We bridge them by registering the board's handlers on a module-local
 * `Map` keyed by `sendCustomEvent` identity. The adapter then
 * forwards events to this target via `dispatchBoardEvent`.
 *
 * The closure identity of `sendCustomEvent` is stable per game-room
 * instance, so using it as the registry key is safe.
 */
type BoardHandlerMap = Record<string, (data: unknown) => void>;

const boardHandlerRegistry = new Map<
	(event: string, payload: unknown) => void,
	BoardHandlerMap
>();

export function dispatchBoardEvent(
	sendCustomEvent: (event: string, payload: unknown) => void,
	event: string,
	data: unknown,
) {
	const map = boardHandlerRegistry.get(sendCustomEvent);
	map?.[event]?.(data);
}

export function useCustomEventsBridge(
	sendCustomEvent: (event: string, payload: unknown) => void,
	handlers: BoardHandlerMap,
) {
	// We keep the latest handlers in a ref so the registry entry can
	// dispatch to the current closures without re-running this effect.
	const ref = useRef(handlers);
	ref.current = handlers;

	// biome-ignore lint/correctness/useExhaustiveDependencies: handlers captured via ref; keys stable per component.
	useEffect(() => {
		const proxy: BoardHandlerMap = {};
		for (const key of Object.keys(handlers)) {
			proxy[key] = (data) => ref.current[key]?.(data);
		}
		boardHandlerRegistry.set(sendCustomEvent, proxy);
		return () => {
			boardHandlerRegistry.delete(sendCustomEvent);
		};
	}, [sendCustomEvent]);
}
