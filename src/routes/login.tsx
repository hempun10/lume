import { useMutation } from "@tanstack/react-query";
import {
	createFileRoute,
	Navigate,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import {
	LoginForm,
	type LoginFormValues,
	SignupForm,
	type SignupFormValues,
	useAuth,
} from "@/features/auth";
import { signInWithPassword, signUp } from "@/features/auth/mutations";
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
	component: LoginPage,
});

function LoginPage() {
	const navigate = useNavigate();
	const { session, isLoading } = useAuth();
	const [mode, setMode] = useState<"login" | "signup">("login");

	const loginMutation = useMutation({
		mutationFn: signInWithPassword,
		onSuccess: () => navigate({ to: "/dashboard" }),
	});

	const signupMutation = useMutation({
		mutationFn: signUp,
		// With email confirmations disabled, signUp auto-signs in the user.
		// Redirect to onboarding so they can set their display name.
		onSuccess: () => navigate({ to: "/onboarding" }),
	});

	// After SSR hydration, beforeLoad doesn't re-run. If the user is already
	// signed in (session restored from localStorage), redirect to dashboard.
	if (!isLoading && session) {
		return <Navigate to="/dashboard" />;
	}

	function toggleMode() {
		setMode((m) => (m === "login" ? "signup" : "login"));
		loginMutation.reset();
		signupMutation.reset();
	}

	async function handleLogin(data: LoginFormValues) {
		loginMutation.mutate({ email: data.email, password: data.password });
	}

	async function handleSignup(data: SignupFormValues) {
		signupMutation.mutate({ email: data.email, password: data.password });
	}

	if (mode === "signup") {
		return (
			<SignupForm
				onSubmit={handleSignup}
				error={signupMutation.error?.message ?? null}
				onToggleMode={toggleMode}
			/>
		);
	}

	return (
		<LoginForm
			onSubmit={handleLogin}
			error={loginMutation.error?.message ?? null}
			onToggleMode={toggleMode}
		/>
	);
}
