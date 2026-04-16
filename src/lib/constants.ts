/**
 * Maximum date of birth — user must be at least 18 years old.
 * Used by date-of-birth pickers in onboarding and settings.
 */
export const MAX_DOB = (() => {
	const d = new Date();
	d.setFullYear(d.getFullYear() - 18);
	return d;
})();
