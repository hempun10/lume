import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [
			{
				title:
					"TanStack Start + Supabase Auth | Production-Ready Starter Template",
			},
			{
				name: "description",
				content: "Get started quickly with TanStack Start and Supabase Auth.",
			},
		],
	}),
	component: HomePage,
});

function HomePage() {
	return (
		<div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
			<p className="text-muted-foreground">Welcome</p>
		</div>
	);
}
