import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
	ResetPasswordForm,
	type ResetPasswordFormValues,
} from "@/features/auth";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/reset-password")({
	head: () => ({
		meta: [
			{ title: "Reset Password | TanStack Start + Supabase Auth" },
			{
				name: "description",
				content: "Set a new password for your account.",
			},
		],
	}),
	component: ResetPasswordPage,
});

function ResetPasswordPage() {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [hasSession, setHasSession] = useState(false);

	useEffect(() => {
		supabase.auth.onAuthStateChange((event) => {
			if (event === "PASSWORD_RECOVERY") {
				setHasSession(true);
			}
		});
	}, []);

	async function handleSubmit(data: ResetPasswordFormValues) {
		setError(null);
		const { error } = await supabase.auth.updateUser({
			password: data.password,
		});

		if (error) {
			setError(error.message);
			return;
		}

		setSuccess(true);
		setTimeout(() => navigate({ to: "/dashboard" }), 2000);
	}

	return (
		<ResetPasswordForm
			onSubmit={handleSubmit}
			error={error}
			success={success}
			hasSession={hasSession}
		/>
	);
}
