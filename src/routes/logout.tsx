import { createFileRoute, redirect } from "@tanstack/react-router";
import { signOut } from "@/features/auth/mutations";

export const Route = createFileRoute("/logout")({
	async beforeLoad({ context: { queryClient } }) {
		// Skip on server — signOut requires the browser Supabase client
		if (typeof window === "undefined") return;

		await signOut();
		// Drop all cached user data so a subsequent login doesn't flash the
		// previous user's profile / interests / onboarding state.
		queryClient.clear();
		throw redirect({ to: "/" });
	},
	pendingMs: 0,
	pendingComponent: LogoutPending,
	component: LogoutPending,
});

function LogoutPending() {
	return (
		<div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
			<p className="text-muted-foreground">Signing out...</p>
		</div>
	);
}
