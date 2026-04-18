import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginView } from "@/features/auth/components/login-view";
import { getSessionReady } from "@/lib/supabase/client";

/**
 * `/signup` is a friendly alias for the sign-up mode of the combined
 * auth view at `/login`. Having a dedicated route means links, tests, and
 * typed URLs like `/signup` don't 404 — they render the same `LoginView`
 * with the sign-up form preselected.
 */
export const Route = createFileRoute("/signup")({
	head: () => ({
		meta: [
			{ title: "Create Account | Lume" },
			{
				name: "description",
				content: "Create a Lume account to start matching with strangers.",
			},
		],
	}),
	async beforeLoad() {
		if (typeof window === "undefined") return;
		const session = await getSessionReady();
		if (session) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: SignupPage,
});

function SignupPage() {
	return <LoginView initialMode="signup" />;
}
