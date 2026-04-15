import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/features/auth";
import type { OnboardingFormValues } from "@/features/onboarding";
import { OnboardingForm } from "@/features/onboarding";
import { completeOnboarding } from "@/features/onboarding/mutations";
import { profileKeys } from "@/features/onboarding/queries";

export const Route = createFileRoute("/_authenticated/onboarding")({
	head: () => ({
		meta: [{ title: "Welcome | Lume" }, { name: "robots", content: "noindex" }],
	}),
	component: OnboardingPage,
});

function OnboardingPage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (data: OnboardingFormValues) => {
			if (!user) throw new Error("You must be signed in.");
			return completeOnboarding({ userId: user.id, data });
		},
		onSuccess: async () => {
			// Wait for cache invalidation before navigating so the auth guard
			// in _authenticated sees the updated onboarding_completed flag.
			if (user) {
				await queryClient.invalidateQueries({
					queryKey: profileKeys.detail(user.id),
				});
			}
			navigate({ to: "/dashboard" });
		},
	});

	async function handleSubmit(data: OnboardingFormValues) {
		mutation.mutate(data);
	}

	return (
		<OnboardingForm
			onSubmit={handleSubmit}
			error={mutation.error?.message ?? null}
		/>
	);
}
