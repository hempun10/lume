import { z } from "zod";

export const onboardingSchema = z.object({
	displayName: z
		.string()
		.min(1, "Display name is required")
		.max(50, "Display name must be 50 characters or less"),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
