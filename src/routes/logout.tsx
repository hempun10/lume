import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { signOut } from "@/features/auth/mutations";

export const Route = createFileRoute("/logout")({
	component: LogoutPage,
});

function LogoutPage() {
	const navigate = useNavigate();
	const didRun = useRef(false);

	const mutation = useMutation({
		mutationFn: signOut,
		onSuccess: () => navigate({ to: "/" }),
	});

	useEffect(() => {
		if (didRun.current) return;
		didRun.current = true;
		mutation.mutate();
	});

	return (
		<div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
			<p className="text-muted-foreground">Signing out...</p>
		</div>
	);
}
