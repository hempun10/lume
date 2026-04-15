import type { Session } from "@supabase/supabase-js";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Outlet,
	redirect,
	useLocation,
	useNavigate,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { requireAuth, useAuth } from "@/features/auth";
import { profileOnboardingOptions } from "@/features/onboarding/queries";

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
			// Query/network errors → redirect to onboarding as a safe fallback
			throw redirect({ to: "/onboarding" });
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
 */
function AuthenticatedLayout() {
	const { session, user, isLoading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading && !session) {
			navigate({ to: "/login" });
		}
	}, [isLoading, session, navigate]);

	if (isLoading || !session || !user) {
		return <AuthPending />;
	}

	return <OnboardingGate userId={user.id} />;
}

/**
 * Checks onboarding status after auth is confirmed.
 * This runs as a component (not in beforeLoad) to cover the SSR → hydration
 * path where beforeLoad doesn't re-run. Uses useSuspenseQuery so the data
 * is guaranteed available when rendering — the pending boundary is AuthPending.
 */
function OnboardingGate({ userId }: { userId: string }) {
	const { data: profile } = useSuspenseQuery(profileOnboardingOptions(userId));
	const navigate = useNavigate();
	const { pathname } = useLocation();

	useEffect(() => {
		if (!profile?.onboarding_completed && pathname !== "/onboarding") {
			navigate({ to: "/onboarding" });
		}
	}, [profile, pathname, navigate]);

	if (!profile?.onboarding_completed && pathname !== "/onboarding") {
		return <AuthPending />;
	}

	return <Outlet />;
}
