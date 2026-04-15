import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/form/form-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { type SignupFormValues, signupSchema } from "../schema";
import type { SignupFormProps } from "../types";
import { AuthLayout } from "./auth-layout";

export function SignupForm({ onSubmit, error, onToggleMode }: SignupFormProps) {
	const form = useForm<SignupFormValues>({
		resolver: zodResolver(signupSchema),
		defaultValues: { email: "", password: "" },
	});

	return (
		<AuthLayout>
			{/* Card */}
			<div className="rounded-2xl border border-foreground/8 bg-card px-8 pb-7 pt-8 shadow-xl dark:border-foreground/10">
				<h1 className="text-xl font-[600] tracking-[-0.01em] text-foreground">
					Create an account
				</h1>
				<p className="mt-1.5 text-sm text-muted-foreground">
					Get started with Lume in seconds.
				</p>

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

						<FormInput
							name="password"
							label="Password"
							icon={Lock}
							type="password"
							placeholder="At least 6 characters"
							autoComplete="new-password"
						/>

						<Button
							type="submit"
							className="w-full rounded-2xl"
							disabled={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting
								? "Creating account..."
								: "Create account"}
						</Button>
					</form>
				</Form>

				{/* Terms */}
				<p className="mt-4 text-center text-xs text-muted-foreground">
					By creating an account, you agree to our{" "}
					<a href="/terms" className="underline underline-offset-4">
						Terms
					</a>{" "}
					and{" "}
					<a href="/privacy" className="underline underline-offset-4">
						Privacy Policy
					</a>
					.
				</p>

				{/* Toggle */}
				<p className="mt-4 text-center text-sm text-muted-foreground">
					Already have an account?{" "}
					<button
						type="button"
						onClick={onToggleMode}
						className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
					>
						Sign in
					</button>
				</p>
			</div>
		</AuthLayout>
	);
}
