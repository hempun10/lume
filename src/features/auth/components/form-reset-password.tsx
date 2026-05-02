import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { KeyRound, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/form/form-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { type ResetPasswordFormValues, resetPasswordSchema } from "../schema";
import type { ResetPasswordFormProps } from "../types";
import { AuthLayout } from "./auth-layout";

export function ResetPasswordForm({
	email,
	onSubmit,
	onResend,
	error,
	success,
	resendSuccess,
}: ResetPasswordFormProps) {
	const form = useForm<ResetPasswordFormValues>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: { otp: "", password: "", confirmPassword: "" },
	});

	if (!email) {
		return (
			<AuthLayout>
				<div className="rounded-2xl border border-foreground/8 bg-card px-8 pb-7 pt-8 shadow-xl dark:border-foreground/10">
					<h1 className="text-xl font-[600] tracking-[-0.01em] text-foreground">
						Reset password
					</h1>
					<p className="mt-4 text-sm text-muted-foreground">
						We need an email address to verify your reset code. Start from the
						forgot-password page.
					</p>
					<p className="mt-5 text-center text-sm text-muted-foreground">
						<Link
							to="/forgot-password"
							className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
						>
							Request a new code
						</Link>
					</p>
				</div>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout>
			<div className="rounded-2xl border border-foreground/8 bg-card px-8 pb-7 pt-8 shadow-xl dark:border-foreground/10">
				<h1 className="text-xl font-[600] tracking-[-0.01em] text-foreground">
					Enter your code
				</h1>
				<p className="mt-1.5 text-sm text-muted-foreground">
					We sent a 6-digit code to{" "}
					<span className="font-medium text-foreground">{email}</span>. Enter it
					below along with your new password.
				</p>

				{success ? (
					<div className="mt-6">
						<Alert>
							<AlertDescription>
								Password updated successfully. Redirecting to dashboard...
							</AlertDescription>
						</Alert>
					</div>
				) : (
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="mt-6 space-y-4"
						>
							{error && (
								<Alert variant="destructive">
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							{resendSuccess && (
								<Alert>
									<AlertDescription>
										New code sent. Check your inbox.
									</AlertDescription>
								</Alert>
							)}

							<FormInput
								name="otp"
								label="Verification code"
								icon={KeyRound}
								type="text"
								autoComplete="one-time-code"
								placeholder="6-digit code"
							/>

							<FormInput
								name="password"
								label="New password"
								icon={Lock}
								type="password"
								placeholder="At least 6 characters"
								autoComplete="new-password"
							/>

							<FormInput
								name="confirmPassword"
								label="Confirm new password"
								icon={Lock}
								type="password"
								placeholder="Re-enter your password"
								autoComplete="new-password"
							/>

							<Button
								type="submit"
								className="w-full rounded-2xl"
								disabled={form.formState.isSubmitting}
							>
								{form.formState.isSubmitting
									? "Updating..."
									: "Update password"}
							</Button>

							<button
								type="button"
								onClick={() => {
									void onResend();
								}}
								className="block w-full text-center text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
							>
								Resend code
							</button>
						</form>
					</Form>
				)}

				<p className="mt-5 text-center text-sm text-muted-foreground">
					<Link
						to="/login"
						className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
					>
						Back to sign in
					</Link>
				</p>
			</div>
		</AuthLayout>
	);
}
