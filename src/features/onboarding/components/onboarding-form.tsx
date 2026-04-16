import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Sparkles, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { DateOfBirthPicker } from "@/components/form/date-of-birth-picker";
import { FormInput } from "@/components/form/form-input";
import { GenderSelect } from "@/components/form/gender-select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import {
	INTEREST_OPTIONS,
	type OnboardingFormValues,
	onboardingSchema,
} from "../schema";
import { InterestTagSelector } from "./interest-tag-selector";

interface OnboardingFormProps {
	onSubmit: (data: OnboardingFormValues) => Promise<void>;
	error?: string | null;
}

export function OnboardingForm({ onSubmit, error }: OnboardingFormProps) {
	const form = useForm<OnboardingFormValues>({
		resolver: zodResolver(onboardingSchema),
		defaultValues: {
			displayName: "",
			dateOfBirth: "",
			gender: undefined,
			region: "",
			interests: [],
		},
	});

	return (
		<AuthLayout
			quote="You're almost there. Set up your profile and start meeting new people instantly."
			caption="One step away from spontaneous connections"
			classNames={{ leftFormClassName: "max-w-[700px]" }}
		>
			{/* Card */}
			<div className="rounded-2xl border border-foreground/8 bg-card px-12 pb-7 pt-8 shadow-xl dark:border-foreground/10">
				<div className="flex items-center gap-3">
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
						<Sparkles className="h-5 w-5 text-primary-foreground" />
					</div>
					<div>
						<h1 className="text-xl font-[600] tracking-[-0.01em] text-foreground">
							Complete your profile
						</h1>
						<p className="text-sm text-muted-foreground">
							Tell us a bit about yourself
						</p>
					</div>
				</div>

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

						{/* Display name */}
						<FormInput
							name="displayName"
							label="Display name"
							icon={User}
							placeholder="What should we call you?"
							autoComplete="name"
						/>

						{/* Date of birth and Gender — side by side */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<DateOfBirthPicker />
							<GenderSelect />
						</div>

						{/* Region (optional) */}
						<FormInput
							name="region"
							label="Region"
							labelSuffix="(optional)"
							icon={Globe}
							placeholder="e.g. New York, London, Tokyo"
							autoComplete="address-level1"
						/>

						{/* Interests */}
						<FormInput
							name="interests"
							label="Interests"
							description="Pick 1–8 topics you enjoy. This helps us match you with like-minded people."
						>
							{(field) => (
								<InterestTagSelector
									options={INTEREST_OPTIONS}
									selected={field.value}
									onChange={field.onChange}
									max={8}
								/>
							)}
						</FormInput>

						<Button
							type="submit"
							className="w-full rounded-2xl"
							disabled={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting
								? "Saving..."
								: "Start exploring Lume"}
						</Button>
					</form>
				</Form>
			</div>
		</AuthLayout>
	);
}
