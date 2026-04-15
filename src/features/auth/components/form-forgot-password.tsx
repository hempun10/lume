import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
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
											className="underline font-medium"
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

							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-[600]">Email</FormLabel>
										<FormControl>
											<div className="flex items-center rounded-lg border border-foreground/10 transition-colors hover:border-foreground/20 focus-within:ring-2 focus-within:ring-ring dark:border-foreground/10">
												<Mail className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
												<input
													type="email"
													placeholder="you@example.com"
													autoComplete="email"
													className="h-9 w-full bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
													{...field}
												/>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
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
