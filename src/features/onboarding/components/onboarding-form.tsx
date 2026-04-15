import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "lucide-react";
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
import { AuthInput } from "@/features/auth/components/auth-input";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { type OnboardingFormValues, onboardingSchema } from "../schema";

interface OnboardingFormProps {
	onSubmit: (data: OnboardingFormValues) => Promise<void>;
	error?: string | null;
}

export function OnboardingForm({ onSubmit, error }: OnboardingFormProps) {
	const form = useForm<OnboardingFormValues>({
		resolver: zodResolver(onboardingSchema),
		defaultValues: { displayName: "" },
	});

	return (
		<AuthLayout
			quote="You're almost there. Set up your profile and start meeting new people instantly."
			caption="One step away from spontaneous connections"
		>
			{/* Card */}
			<div className="rounded-2xl border border-foreground/8 bg-card px-8 pb-7 pt-8 shadow-xl dark:border-foreground/10">
				<h1 className="text-xl font-[600] tracking-[-0.01em] text-foreground">
					Welcome to Lume
				</h1>
				<p className="mt-1.5 text-sm text-muted-foreground">
					Let's get your profile set up. What should we call you?
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

						<FormField
							control={form.control}
							name="displayName"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm font-[600]">
										Display name
									</FormLabel>
									<FormControl>
										<AuthInput
											icon={User}
											type="text"
											placeholder="Your name"
											autoComplete="name"
											{...field}
										/>
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
							{form.formState.isSubmitting ? "Saving..." : "Continue to Lume"}
						</Button>
					</form>
				</Form>
			</div>
		</AuthLayout>
	);
}
