import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { FieldPassword, FieldText } from "@/components/form";
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
import { type LoginFormValues, loginSchema } from "../schema";
import type { LoginFormProps } from "../types";

export function LoginForm({ onSubmit, error, onToggleMode }: LoginFormProps) {
	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: "", password: "" },
	});

	return (
		<div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl">Log in</CardTitle>
					<CardDescription>
						Enter your email and password to access your account.
					</CardDescription>
				</CardHeader>
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
							<FieldPassword
								control={form.control}
								name="password"
								label="Password"
								autoComplete="current-password"
							/>
						</CardContent>
						<CardFooter className="flex flex-col gap-4">
							<Button
								type="submit"
								className="w-full"
								disabled={form.formState.isSubmitting}
							>
								{form.formState.isSubmitting ? "Logging in..." : "Log in"}
							</Button>
							<div className="flex flex-col items-center gap-2">
								<button
									type="button"
									onClick={onToggleMode}
									className="text-sm text-muted-foreground hover:underline"
								>
									Don't have an account? Sign up
								</button>
								<Link
									to="/forgot-password"
									className="text-sm text-muted-foreground hover:underline"
								>
									Forgot your password?
								</Link>
							</div>
						</CardFooter>
					</form>
				</Form>
			</Card>
		</div>
	);
}
