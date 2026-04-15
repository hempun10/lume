import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
	ResetPasswordForm,
	type ResetPasswordFormValues,
} from "@/features/auth";
import { updateUserPassword } from "@/features/auth/mutations";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/reset-password")({
	head: () => ({
		meta: [
			{ title: "Reset Password | Lume" },
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
	const [hasSession, setHasSession] = useState(false);

	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event) => {
			if (event === "PASSWORD_RECOVERY") {
				setHasSession(true);
			}
		});
		return () => subscription.unsubscribe();
	}, []);

	const mutation = useMutation({
		mutationFn: updateUserPassword,
		onSuccess: () => {
			setTimeout(() => navigate({ to: "/dashboard" }), 2000);
		},
	});

	async function handleSubmit(data: ResetPasswordFormValues) {
		mutation.mutate({ password: data.password });
	}

	return (
		<ResetPasswordForm
			onSubmit={handleSubmit}
			error={mutation.error?.message ?? null}
			success={mutation.isSuccess}
			hasSession={hasSession}
		/>
	);
}
