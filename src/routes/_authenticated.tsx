import type { Session } from "@supabase/supabase-js";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Navigate,
	Outlet,
	redirect,
	useLocation,
} from "@tanstack/react-router";
import { requireAuth, useAuth } from "@/features/auth";
import { profileOnboardingOptions } from "@/features/onboarding/queries";
import { DashboardShell } from "@/layout/dashboard-shell";

export const Route = createFileRoute("/_authenticated")({
	async beforeLoad({ location, context: { queryClient } }) {
		// Server has no access to the client-side Supabase session (localStorage).
		// Skip auth check during SSR — the component handles it after hydration
		// via useAuth() which listens to Supabase's onAuthStateChange.
		if (typeof window === "undefined") {
			return { session: null as Session | null };
		}

		const session = await requireAuth();

		// Skip profile check if already heading to onboarding
		if (location.pathname === "/onboarding") {
			return { session: session as Session | null };
		}

		// Prefetch onboarding status via TanStack Query — cached for 5 min
		try {
			const profile = await queryClient.ensureQueryData(
				profileOnboardingOptions(session.user.id),
			);

			if (!profile?.onboarding_completed) {
				throw redirect({ to: "/onboarding" });
			}
		} catch (err) {
			// Re-throw redirects
			if (err instanceof Error === false && typeof err === "object") {
				throw err;
			}
			// Query/network errors → redirect to login (safer than onboarding,
			// which can loop a signed-out user back through the auth guard).
			throw redirect({ to: "/login" });
		}

		return { session: session as Session | null };
	},
	// Show loading state immediately while client-side beforeLoad resolves auth
	pendingMs: 0,
	pendingComponent: AuthPending,
	component: AuthenticatedLayout,
});

function AuthPending() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
		</div>
	);
}

/**
 * Handles the SSR → hydration transition for auth.
 *
 * On the server, beforeLoad returns { session: null } because there is no
 * localStorage. TanStack Start rehydrates this on the client without re-running
 * beforeLoad, so the route context stays null. We use useAuth() (backed by
 * Supabase's onAuthStateChange listener) to detect the real session after
 * hydration and guard accordingly.
 *
 * To avoid a race condition after sign-in (where beforeLoad has already
 * confirmed auth via Supabase client, but useAuth()'s React state hasn't
 * processed the SIGNED_IN event yet), we fall back to the route context
 * session from beforeLoad.
 */
function AuthenticatedLayout() {
	const { session: routeSession } = Route.useRouteContext();
	const { session: authSession, isLoading } = useAuth();

	// Once the auth listener has loaded, trust its state (including null after
	// SIGNED_OUT). Only fall back to the route context session while the listener
	// is still initializing — this covers the SSR → hydration race on first paint
	// without keeping stale sessions alive after logout.
	const session = isLoading ? (authSession ?? routeSession) : authSession;
	const user = session?.user ?? null;

	if (isLoading && !session) {
		return <AuthPending />;
	}

	if (!session || !user) {
		return <Navigate to="/login" />;
	}

	return <OnboardingGate userId={user.id} />;
}

/**
 * Checks onboarding status after auth is confirmed.
 * This runs as a component (not in beforeLoad) to cover the SSR → hydration
 * path where beforeLoad doesn't re-run. Uses useSuspenseQuery so the data
 * is guaranteed available when rendering — the pending boundary is AuthPending.
 *
 * Uses declarative <Navigate> instead of useEffect + navigate for redirects.
 */
function OnboardingGate({ userId }: { userId: string }) {
	const { data: profile } = useSuspenseQuery(profileOnboardingOptions(userId));
	const { pathname } = useLocation();

	if (!profile?.onboarding_completed && pathname !== "/onboarding") {
		return <Navigate to="/onboarding" />;
	}

	// Onboarding uses its own full-screen layout — skip the dashboard shell
	if (pathname === "/onboarding") {
		return <Outlet />;
	}

	return (
		<DashboardShell>
			<Outlet />
		</DashboardShell>
	);
}
