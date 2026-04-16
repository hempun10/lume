/**
 * Cross-route memory for a "play this specific game" intent. The user
 * clicks Play on a game card in the catalog, we stash the gameId here,
 * the lobby auto-starts matching, and the chat view auto-sends the
 * invite the moment it mounts.
 *
 * SessionStorage is used (not localStorage) so the intent doesn't
 * survive tab close — if a user bails and comes back tomorrow, they
 * shouldn't be silently matched into Connect Four.
 */
const KEY = "lume:pending-game";

export function setPendingGame(gameId: string): void {
	if (typeof window === "undefined") return;
	try {
		window.sessionStorage.setItem(KEY, gameId);
	} catch {
		// Storage unavailable (private mode, quota) — silently noop;
		// the user just loses the auto-invite shortcut.
	}
}

export function getPendingGame(): string | null {
	if (typeof window === "undefined") return null;
	try {
		return window.sessionStorage.getItem(KEY);
	} catch {
		return null;
	}
}

export function clearPendingGame(): void {
	if (typeof window === "undefined") return;
	try {
		window.sessionStorage.removeItem(KEY);
	} catch {
		// ignore
	}
}
