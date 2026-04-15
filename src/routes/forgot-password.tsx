import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	ForgotPasswordForm,
	type ForgotPasswordFormValues,
} from "@/features/auth";
import { resetPasswordForEmail } from "@/features/auth/mutations";

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
	const mutation = useMutation({
		mutationFn: resetPasswordForEmail,
	});

	async function handleSubmit(data: ForgotPasswordFormValues) {
		mutation.mutate({
			email: data.email,
			redirectTo: `${window.location.origin}/reset-password`,
		});
	}

	return (
		<ForgotPasswordForm
			onSubmit={handleSubmit}
			error={mutation.error?.message ?? null}
			success={mutation.isSuccess}
		/>
	);
}
