import { createFileRoute } from "@tanstack/react-router";
import { SettingsView } from "@/features/settings";

export const Route = createFileRoute("/_authenticated/settings")({
	head: () => ({
		meta: [
			{ title: "Settings | Lume" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: SettingsPage,
});

function SettingsPage() {
	return <SettingsView />;
}
