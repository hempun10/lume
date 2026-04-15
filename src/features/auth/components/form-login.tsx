import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { Lock, Mail } from "lucide-react";
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
import { type LoginFormValues, loginSchema } from "../schema";
import type { LoginFormProps } from "../types";
import { AuthInput } from "./auth-input";
import { AuthLayout } from "./auth-layout";

export function LoginForm({ onSubmit, error, onToggleMode }: LoginFormProps) {
	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: "", password: "" },
	});

	return (
		<AuthLayout>
			{/* Card */}
			<div className="rounded-2xl border border-foreground/8 bg-card px-8 pb-7 pt-8 shadow-xl dark:border-foreground/10">
				<h1 className="text-xl font-[600] tracking-[-0.01em] text-foreground">
					Welcome back
				</h1>
				<p className="mt-1.5 text-sm text-muted-foreground">
					Sign in to your account to continue.
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

						{/* Email */}
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm font-[600]">Email</FormLabel>
									<FormControl>
										<AuthInput
											icon={Mail}
											type="email"
											placeholder="you@example.com"
											autoComplete="email"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Password */}
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm font-[600]">Password</FormLabel>
									<FormControl>
										<AuthInput
											icon={Lock}
											type="password"
											placeholder="Enter your password"
											autoComplete="current-password"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Submit */}
						<Button
							type="submit"
							className="w-full rounded-2xl"
							disabled={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting ? "Signing in..." : "Sign in"}
						</Button>
					</form>
				</Form>

				{/* Footer links */}
				<div className="mt-5 flex flex-col items-center gap-2">
					<p className="text-sm text-muted-foreground">
						Don't have an account?{" "}
						<button
							type="button"
							onClick={onToggleMode}
							className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
						>
							Sign up
						</button>
					</p>
					<Link
						to="/forgot-password"
						className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground/80"
					>
						Forgot your password?
					</Link>
				</div>
			</div>
		</AuthLayout>
	);
}
