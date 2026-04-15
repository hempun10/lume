import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FieldPassword } from "@/components/form";
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
import { type ResetPasswordFormValues, resetPasswordSchema } from "../schema";
import type { ResetPasswordFormProps } from "../types";

export function ResetPasswordForm({
	onSubmit,
	error,
	success,
	hasSession,
}: ResetPasswordFormProps) {
	const form = useForm<ResetPasswordFormValues>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: { password: "", confirmPassword: "" },
	});

	if (!hasSession) {
		return (
			<div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle className="text-2xl">Reset password</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">
							Verifying your reset link...
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl">Set new password</CardTitle>
					<CardDescription>Enter your new password below.</CardDescription>
				</CardHeader>
				{success ? (
					<CardContent>
						<Alert>
							<AlertDescription>
								Password updated successfully. Redirecting to dashboard...
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
								<FieldPassword
									control={form.control}
									name="password"
									label="New password"
									autoComplete="new-password"
								/>
								<FieldPassword
									control={form.control}
									name="confirmPassword"
									label="Confirm new password"
									autoComplete="new-password"
								/>
							</CardContent>
							<CardFooter>
								<Button
									type="submit"
									className="w-full"
									disabled={form.formState.isSubmitting}
								>
									{form.formState.isSubmitting
										? "Updating..."
										: "Update password"}
								</Button>
							</CardFooter>
						</form>
					</Form>
				)}
			</Card>
		</div>
	);
}
