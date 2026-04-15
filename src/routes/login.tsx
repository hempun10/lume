import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
	LoginForm,
	type LoginFormValues,
	SignupForm,
	type SignupFormValues,
} from "@/features/auth";
import { getSessionReady, supabase } from "@/lib/supabase/client";

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
		const session = await getSessionReady();

		if (session) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: LoginPage,
});

function LoginPage() {
	const navigate = useNavigate();
	const [mode, setMode] = useState<"login" | "signup">("login");
	const [error, setError] = useState<string | null>(null);

	// Client-side fallback: on a full page load (e.g. page.goto), beforeLoad runs
	// on the server where there's no localStorage session. This effect catches the
	// case where the client has a valid session after hydration.
	useEffect(() => {
		getSessionReady().then((session) => {
			if (session) {
				navigate({ to: "/dashboard" });
			}
		});
	}, [navigate]);

	function toggleMode() {
		setMode((m) => (m === "login" ? "signup" : "login"));
		setError(null);
	}

	async function handleLogin(data: LoginFormValues) {
		setError(null);
		const { error } = await supabase.auth.signInWithPassword({
			email: data.email,
			password: data.password,
		});

		if (error) {
			setError(error.message);
			return;
		}

		navigate({ to: "/dashboard" });
	}

	async function handleSignup(data: SignupFormValues) {
		setError(null);
		const { error } = await supabase.auth.signUp({
			email: data.email,
			password: data.password,
		});

		if (error) {
			setError(error.message);
			return;
		}

		// With email confirmations disabled, signUp auto-signs in the user.
		// Redirect to onboarding so they can set their display name.
		navigate({ to: "/onboarding" });
	}

	if (mode === "signup") {
		return (
			<SignupForm
				onSubmit={handleSignup}
				error={error}
				onToggleMode={toggleMode}
			/>
		);
	}

	return (
		<LoginForm onSubmit={handleLogin} error={error} onToggleMode={toggleMode} />
	);
}
