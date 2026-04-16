import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { profileKeys } from "@/features/onboarding/queries";
import { updatePreferences, updateProfile } from "../mutations";
import type { PreferencesFormValues, ProfileFormValues } from "../types";

/**
 * Encapsulates profile + preferences mutations with success/error state.
 * Handles cache invalidation and auto-dismiss of success messages.
 */
export function useSettingsMutations(userId: string) {
	const queryClient = useQueryClient();
	const [profileSuccess, setProfileSuccess] = useState(false);
	const [prefsSuccess, setPrefsSuccess] = useState(false);

	const profileMutation = useMutation({
		mutationFn: (data: ProfileFormValues) => updateProfile({ userId, data }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: profileKeys.detail(userId),
			});
			setProfileSuccess(true);
			setTimeout(() => setProfileSuccess(false), 3000);
		},
	});

	const prefsMutation = useMutation({
		mutationFn: (data: PreferencesFormValues) =>
			updatePreferences({ userId, data }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: profileKeys.detail(userId),
			});
			setPrefsSuccess(true);
			setTimeout(() => setPrefsSuccess(false), 3000);
		},
	});

	return {
		profileMutation,
		profileSuccess,
		prefsMutation,
		prefsSuccess,
		saveProfile: (data: ProfileFormValues) => profileMutation.mutate(data),
		savePreferences: (data: PreferencesFormValues) =>
			prefsMutation.mutate(data),
	};
}
