import { useSuspenseQuery } from "@tanstack/react-query";
import { Settings } from "lucide-react";
import { useAuth } from "@/features/auth";
import { useSettingsMutations } from "../hooks/use-settings-mutations";
import { profileDetailOptions } from "../queries";
import { PreferencesSection } from "./preferences-section";
import { ProfileSection } from "./profile-section";

export function SettingsView() {
	const { user } = useAuth();
	const userId = user?.id ?? "";

	const { data: profile } = useSuspenseQuery(profileDetailOptions(userId));
	const {
		profileMutation,
		profileSuccess,
		prefsMutation,
		prefsSuccess,
		saveProfile,
		savePreferences,
	} = useSettingsMutations(userId);

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
					onSave={saveProfile}
					isSaving={profileMutation.isPending}
					saveError={profileMutation.error?.message ?? null}
					saveSuccess={profileSuccess}
				/>

				<PreferencesSection
					profile={profile}
					onSave={savePreferences}
					isSaving={prefsMutation.isPending}
					saveError={prefsMutation.error?.message ?? null}
					saveSuccess={prefsSuccess}
				/>
			</div>
		</div>
	);
}
