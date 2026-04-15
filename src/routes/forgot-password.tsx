import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
	ForgotPasswordForm,
	type ForgotPasswordFormValues,
} from "@/features/auth";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/forgot-password")({
	head: () => ({
		meta: [
			{ title: "Forgot Password | Lume" },
			{
				name: "description",
				content:
					"Request a password reset link to regain access to your account.",
			},
		],
	}),
	component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	async function handleSubmit(data: ForgotPasswordFormValues) {
		setError(null);
		const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
			redirectTo: `${window.location.origin}/reset-password`,
		});

		if (error) {
			setError(error.message);
			return;
		}

		setSuccess(true);
	}

	return (
		<ForgotPasswordForm
			onSubmit={handleSubmit}
			error={error}
			success={success}
		/>
	);
}
