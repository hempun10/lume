import { z } from "zod";

export const profileSchema = z.object({
	displayName: z
		.string()
		.min(1, "Display name is required")
		.max(50, "Display name must be 50 characters or less"),
	dateOfBirth: z.string().min(1, "Date of birth is required"),
	gender: z.enum(["male", "female", "non-binary", "prefer-not-to-say", ""], {
		message: "Please select a gender",
	}),
	region: z.string().max(100, "Region must be 100 characters or less"),
});

export const preferencesSchema = z.object({
	interests: z
		.array(z.string())
		.min(1, "Select at least one interest")
		.max(8, "Select up to 8 interests"),
});
