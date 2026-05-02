import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import {
	ResetPasswordForm,
	type ResetPasswordFormValues,
} from "@/features/auth";
import {
	resetPasswordForEmail,
	updateUserPassword,
	verifyRecoveryOtp,
} from "@/features/auth/mutations";

const searchSchema = z.object({
	email: z.string().email().optional(),
});

export const Route = createFileRoute("/reset-password")({
	validateSearch: searchSchema,
	head: () => ({
		meta: [
			{ title: "Reset Password | Lume" },
			{
				name: "description",
				content:
					"Enter the 6-digit code from your email and choose a new password.",
			},
		],
	}),
	component: ResetPasswordPage,
});

function ResetPasswordPage() {
	const { email } = Route.useSearch();
	const navigate = useNavigate();
	const [resendSuccess, setResendSuccess] = useState(false);

	const submitMutation = useMutation({
		mutationFn: async (data: ResetPasswordFormValues) => {
			if (!email) {
				throw new Error(
					"Missing email — start over from the forgot-password page.",
				);
			}
			// 1. Exchange the OTP for a recovery session.
			await verifyRecoveryOtp({ email, token: data.otp });
			// 2. With the session in place, set the new password.
			await updateUserPassword({ password: data.password });
		},
		onSuccess: () => {
			setTimeout(() => navigate({ to: "/dashboard" }), 3500);
		},
	});

	const resendMutation = useMutation({
		mutationFn: resetPasswordForEmail,
		onSuccess: () => setResendSuccess(true),
	});

	async function handleSubmit(data: ResetPasswordFormValues) {
		submitMutation.mutate(data);
	}

	async function handleResend() {
		if (!email) return;
		setResendSuccess(false);
		resendMutation.mutate({ email });
	}

	return (
		<ResetPasswordForm
			email={email ?? null}
			onSubmit={handleSubmit}
			onResend={handleResend}
			error={
				submitMutation.error?.message ?? resendMutation.error?.message ?? null
			}
			success={submitMutation.isSuccess}
			resendSuccess={resendSuccess}
		/>
	);
}
