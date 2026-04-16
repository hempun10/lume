import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { Settings } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/features/auth";
import { profileKeys } from "@/features/onboarding/queries";
import { updatePreferences, updateProfile } from "../mutations";
import { profileDetailOptions } from "../queries";
import type { PreferencesFormValues, ProfileFormValues } from "../types";
import { PreferencesSection } from "./preferences-section";
import { ProfileSection } from "./profile-section";

export function SettingsView() {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const userId = user?.id ?? "";

	const { data: profile } = useSuspenseQuery(profileDetailOptions(userId));

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

	async function handleProfileSave(data: ProfileFormValues) {
		profileMutation.mutate(data);
	}

	async function handlePrefsSave(data: PreferencesFormValues) {
		prefsMutation.mutate(data);
	}

	return (
		<div className="mx-auto max-w-2xl px-4 py-6 md:px-6 md:py-8">
			{/* Header */}
			<div className="mb-8 flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
					<Settings className="h-5 w-5" />
				</div>
				<div>
					<h1 className="text-xl font-semibold text-foreground">Settings</h1>
					<p className="text-sm text-muted-foreground">
						Manage your profile and preferences
					</p>
				</div>
			</div>

			{/* Sections */}
			<div className="space-y-6">
				<ProfileSection
					profile={profile}
					onSave={handleProfileSave}
					isSaving={profileMutation.isPending}
					saveError={profileMutation.error?.message ?? null}
					saveSuccess={profileSuccess}
				/>

				<PreferencesSection
					profile={profile}
					onSave={handlePrefsSave}
					isSaving={prefsMutation.isPending}
					saveError={prefsMutation.error?.message ?? null}
					saveSuccess={prefsSuccess}
				/>
			</div>
		</div>
	);
}
