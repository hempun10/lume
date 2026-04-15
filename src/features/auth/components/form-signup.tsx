import { zodResolver } from "@hookform/resolvers/zod";
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
import { type SignupFormValues, signupSchema } from "../schema";
import type { SignupFormProps } from "../types";

export function SignupForm({ onSubmit, error, onToggleMode }: SignupFormProps) {
	const form = useForm<SignupFormValues>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			displayName: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	return (
		<div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl">Create account</CardTitle>
					<CardDescription>Create an account to get started.</CardDescription>
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
								name="displayName"
								label="Display name"
								placeholder="Your name"
								autoComplete="name"
							/>
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
								autoComplete="new-password"
							/>
							<FieldPassword
								control={form.control}
								name="confirmPassword"
								label="Confirm password"
								autoComplete="new-password"
							/>
						</CardContent>
						<CardFooter className="flex flex-col gap-4">
							<Button
								type="submit"
								className="w-full"
								disabled={form.formState.isSubmitting}
							>
								{form.formState.isSubmitting
									? "Creating account..."
									: "Create account"}
							</Button>
							<button
								type="button"
								onClick={onToggleMode}
								className="text-sm text-muted-foreground hover:underline"
							>
								Already have an account? Log in
							</button>
						</CardFooter>
					</form>
				</Form>
			</Card>
		</div>
	);
}
