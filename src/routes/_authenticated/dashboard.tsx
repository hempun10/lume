import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/features/auth";
import { DashboardContent } from "@/features/dashboard";

export const Route = createFileRoute("/_authenticated/dashboard")({
	head: () => ({
		meta: [
			{ title: "Dashboard | Lume" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: DashboardPage,
});

function DashboardPage() {
	const { user } = useAuth();
	return <DashboardContent user={user} />;
}
