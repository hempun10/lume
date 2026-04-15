import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { FieldText } from "@/components/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { type ForgotPasswordFormValues, forgotPasswordSchema } from "../schema";
import type { ForgotPasswordFormProps } from "../types";

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
		<div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl">Reset password</CardTitle>
					<CardDescription>
						Enter your email and we'll send you a link to reset your password.
					</CardDescription>
				</CardHeader>
				{success ? (
					<CardContent>
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
					</CardContent>
				) : (
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)}>
							<CardContent className="space-y-4">
								{error && (
									<Alert variant="destructive">
										<AlertDescription>{error}</AlertDescription>
									</Alert>
								)}
								<FieldText
									control={form.control}
									name="email"
									label="Email"
									type="email"
									placeholder="you@example.com"
									autoComplete="email"
								/>
							</CardContent>
							<CardFooter className="flex flex-col gap-4">
								<Button
									type="submit"
									className="w-full"
									disabled={form.formState.isSubmitting}
								>
									{form.formState.isSubmitting
										? "Sending..."
										: "Send reset link"}
								</Button>
								<Link
									to="/login"
									className="text-sm text-muted-foreground hover:underline"
								>
									Back to login
								</Link>
							</CardFooter>
						</form>
					</Form>
				)}
			</Card>
		</div>
	);
}
