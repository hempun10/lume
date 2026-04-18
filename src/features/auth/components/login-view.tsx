import { useMutation } from "@tanstack/react-query";
import { Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../context/auth-context";
import { signInWithPassword, signUp } from "../mutations";
import type { LoginFormValues, SignupFormValues } from "../schema";
import { LoginForm } from "./form-login";
import { SignupForm } from "./form-signup";

export function LoginView({
	initialMode = "login",
}: {
	initialMode?: "login" | "signup";
} = {}) {
	const navigate = useNavigate();
	const { session, isLoading } = useAuth();
	const [mode, setMode] = useState<"login" | "signup">(initialMode);

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
