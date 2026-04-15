import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Globe, Sparkles, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/form/form-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form } from "@/components/ui/form";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { cn } from "@/lib/utils";
import {
	GENDER_OPTIONS,
	INTEREST_OPTIONS,
	type OnboardingFormValues,
	onboardingSchema,
} from "../schema";
import { InterestTagSelector } from "./interest-tag-selector";

interface OnboardingFormProps {
	onSubmit: (data: OnboardingFormValues) => Promise<void>;
	error?: string | null;
}

const MAX_DOB = (() => {
	const d = new Date();
	d.setFullYear(d.getFullYear() - 18);
	return d;
})();

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
							{/* Date of birth — Calendar popover */}
							<FormInput name="dateOfBirth" label="Date of birth">
								{(field) => (
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className={cn(
													"w-full justify-start text-left font-normal",
													!field.value && "text-muted-foreground",
												)}
											>
												<CalendarIcon className="mr-2 h-4 w-4" />
												{field.value
													? format(new Date(field.value), "MMM d, yyyy")
													: "Pick a date"}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={
													field.value ? new Date(field.value) : undefined
												}
												onSelect={(date) => {
													if (date) {
														field.onChange(format(date, "yyyy-MM-dd"));
													}
												}}
												defaultMonth={MAX_DOB}
												disabled={{ after: MAX_DOB }}
												captionLayout="dropdown"
												fromYear={1920}
												toYear={MAX_DOB.getFullYear()}
											/>
										</PopoverContent>
									</Popover>
								)}
							</FormInput>

							{/* Gender — shadcn Select */}
							<FormInput name="gender" label="Gender">
								{(field) => (
									<Select
										value={field.value ?? ""}
										onValueChange={field.onChange}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select gender" />
										</SelectTrigger>
										<SelectContent>
											{GENDER_OPTIONS.map((opt) => (
												<SelectItem key={opt.value} value={opt.value}>
													{opt.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</FormInput>
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
