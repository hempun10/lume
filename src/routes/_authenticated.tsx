import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { requireAuth } from "@/features/auth";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/_authenticated")({
	async beforeLoad({ location }) {
		const session = await requireAuth();

		// Skip profile check if already heading to onboarding
		if (location.pathname === "/onboarding") {
			return;
		}

		// Check if profile has a display name; redirect to onboarding if not
		const { data: profile } = await supabase
			.from("profiles")
			.select("display_name")
			.eq("id", session.user.id)
			.single();

		if (!profile?.display_name) {
			throw redirect({ to: "/onboarding" });
		}
	},
	component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
	return <Outlet />;
}
