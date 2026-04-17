import { z } from "zod";

export const GENDER_OPTIONS = [
	{ value: "male", label: "Male" },
	{ value: "female", label: "Female" },
	{ value: "non-binary", label: "Non-binary" },
	{ value: "prefer-not-to-say", label: "Prefer not to say" },
] as const;

export type GenderValue = (typeof GENDER_OPTIONS)[number]["value"];

export const INTEREST_OPTIONS = [
	"Gaming",
	"Music",
	"Movies",
	"Sports",
	"Travel",
	"Reading",
	"Cooking",
	"Art",
	"Photography",
	"Fitness",
	"Technology",
	"Fashion",
	"Anime",
	"Science",
	"History",
	"Nature",
	"Pets",
	"Comedy",
] as const;

/**
 * Calculate minimum date of birth for 18+ requirement.
 * Returns an ISO date string (YYYY-MM-DD) for the latest allowable DOB.
 */
function getMaxDateOfBirth(): string {
	const today = new Date();
	const minDate = new Date(
		today.getFullYear() - 18,
		today.getMonth(),
		today.getDate(),
	);
	return minDate.toISOString().split("T")[0];
}

export const onboardingSchema = z.object({
	displayName: z
		.string()
		.min(1, "Display name is required")
		.max(50, "Display name must be 50 characters or less"),
	dateOfBirth: z
		.string()
		.min(1, "Date of birth is required")
		.refine(
			(val) => {
				const dob = new Date(val);
				const maxDob = new Date(getMaxDateOfBirth());
				return dob <= maxDob;
			},
			{ message: "You must be at least 18 years old" },
		),
	gender: z.enum(["male", "female", "non-binary", "prefer-not-to-say"], {
		message: "Please select a gender",
	}),
	region: z
		.string()
		.max(100, "Region must be 100 characters or less")
		.optional()
		.or(z.literal("")),
	interests: z
		.array(z.string())
		.min(1, "Select at least one interest")
		.max(8, "Select up to 8 interests"),
	consent: z.literal(true, {
		message: "You must agree to the Terms and Privacy Policy",
	}),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
