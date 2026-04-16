import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginView } from "@/features/auth/components/login-view";
import { getSessionReady } from "@/lib/supabase/client";

export const Route = createFileRoute("/login")({
	head: () => ({
		meta: [
			{ title: "Sign In | Lume" },
			{
				name: "description",
				content: "Sign in or create an account to access your dashboard.",
			},
		],
	}),
	async beforeLoad() {
		// Server has no access to the client-side Supabase session (localStorage).
		// Skip redirect check during SSR — the client will handle it after hydration.
		if (typeof window === "undefined") return;

		const session = await getSessionReady();

		if (session) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: LoginView,
});
