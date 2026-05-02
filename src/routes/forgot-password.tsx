import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
					"Request a 6-digit verification code to reset your account password.",
			},
		],
	}),
	component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
	const navigate = useNavigate();
	const mutation = useMutation({
		mutationFn: resetPasswordForEmail,
		onSuccess: (_data, variables) => {
			// Hand off to /reset-password with the email so the user can enter
			// the OTP from their inbox.
			void navigate({
				to: "/reset-password",
				search: { email: variables.email },
			});
		},
	});

	async function handleSubmit(data: ForgotPasswordFormValues) {
		mutation.mutate({ email: data.email });
	}

	return (
		<ForgotPasswordForm
			onSubmit={handleSubmit}
			error={mutation.error?.message ?? null}
			success={mutation.isSuccess}
		/>
	);
}
