import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, User } from "lucide-react";
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
		<div className="flex min-h-[calc(100vh-64px)]">
			{/* Left — form side */}
			<div className="flex w-full items-center justify-center bg-muted p-6 lg:w-1/2 lg:p-10">
				<div className="w-full max-w-[400px]">
					{/* Logo icon */}
					<div className="mb-6 flex h-9 w-9 items-center justify-center rounded-lg bg-foreground">
						<Sparkles className="h-5 w-5 text-background" />
					</div>

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
												<div className="flex items-center rounded-lg border border-foreground/10 transition-colors hover:border-foreground/20 focus-within:ring-2 focus-within:ring-ring dark:border-foreground/10">
													<User className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
													<input
														type="text"
														placeholder="Your name"
														autoComplete="name"
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
									{form.formState.isSubmitting
										? "Saving..."
										: "Continue to Lume"}
								</Button>
							</form>
						</Form>
					</div>
				</div>
			</div>

			{/* Right — branding panel (desktop only) */}
			<div className="relative hidden items-center justify-center overflow-hidden bg-background lg:flex lg:w-1/2">
				{/* Dot grid background */}
				<div
					className="absolute inset-0"
					style={{
						backgroundImage:
							"radial-gradient(circle, var(--color-foreground) 0.75px, transparent 0.75px)",
						backgroundSize: "24px 24px",
						opacity: 0.07,
					}}
				/>

				{/* Branding content */}
				<div className="relative z-10 flex max-w-sm flex-col items-center gap-6 px-8 text-center">
					<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground">
						<Sparkles className="h-8 w-8 text-background" />
					</div>
					<blockquote className="space-y-3">
						<p className="text-lg font-medium leading-relaxed text-foreground">
							"You're almost there. Set up your profile and start meeting new
							people instantly."
						</p>
						<footer className="text-sm text-muted-foreground">
							One step away from spontaneous connections
						</footer>
					</blockquote>
				</div>
			</div>
		</div>
	);
}
