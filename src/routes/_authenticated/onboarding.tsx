import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/features/auth";
import type { OnboardingFormValues } from "@/features/onboarding";
import { OnboardingForm } from "@/features/onboarding";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/_authenticated/onboarding")({
	head: () => ({
		meta: [{ title: "Welcome | Lume" }, { name: "robots", content: "noindex" }],
	}),
	component: OnboardingPage,
});

function OnboardingPage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(data: OnboardingFormValues) {
		setError(null);

		if (!user) {
			setError("You must be signed in.");
			return;
		}

		const { error: updateError } = await supabase
			.from("profiles")
			.update({ display_name: data.displayName })
			.eq("id", user.id);

		if (updateError) {
			setError(updateError.message);
			return;
		}

		navigate({ to: "/dashboard" });
	}

	return <OnboardingForm onSubmit={handleSubmit} error={error} />;
}
