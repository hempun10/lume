import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/form/form-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { type ForgotPasswordFormValues, forgotPasswordSchema } from "../schema";
import type { ForgotPasswordFormProps } from "../types";
import { AuthLayout } from "./auth-layout";

export function ForgotPasswordForm({
	onSubmit,
	error,
	success,
}: ForgotPasswordFormProps) {
	const form = useForm<ForgotPasswordFormValues>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: { email: "" },
	});

	return (
		<AuthLayout>
			<div className="rounded-2xl border border-foreground/8 bg-card px-8 pb-7 pt-8 shadow-xl dark:border-foreground/10">
				<h1 className="text-xl font-[600] tracking-[-0.01em] text-foreground">
					Reset password
				</h1>
				<p className="mt-1.5 text-sm text-muted-foreground">
					Enter your email and we'll send you a link to reset your password.
				</p>

				{success ? (
					<div className="mt-6">
						<Alert>
							<AlertDescription>
								Check your email for a password reset link.
								{import.meta.env.DEV && (
									<>
										{" "}
										Local dev: check Mailpit at{" "}
										<a
											href="http://127.0.0.1:54324"
											target="_blank"
											rel="noreferrer"
											className="font-medium underline"
										>
											http://127.0.0.1:54324
										</a>
									</>
								)}
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

							<FormInput
								name="email"
								label="Email"
								icon={Mail}
								type="email"
								placeholder="you@example.com"
								autoComplete="email"
							/>

							<Button
								type="submit"
								className="w-full rounded-2xl"
								disabled={form.formState.isSubmitting}
							>
								{form.formState.isSubmitting ? "Sending..." : "Send reset link"}
							</Button>
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
