import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_landing/privacy")({
	head: () => ({
		meta: [
			{ title: "Privacy Policy — Lume" },
			{
				name: "description",
				content: "How Lume collects, uses, and protects your information.",
			},
		],
	}),
	component: PrivacyPage,
});

function PrivacyPage() {
	return (
		<article className="mx-auto max-w-3xl px-6 py-16 sm:px-8 lg:px-10">
			<header className="mb-10">
				<h1 className="text-4xl font-semibold tracking-tight text-foreground">
					Privacy Policy
				</h1>
				<p className="mt-3 text-sm text-muted-foreground">
					Last updated: {new Date().toLocaleDateString()}
				</p>
			</header>

			<div className="space-y-8 text-foreground">
				<section className="space-y-3">
					<h2 className="text-xl font-semibold">1. What we collect</h2>
					<p className="text-muted-foreground">
						Account information (email, display name, avatar), profile details
						you add (bio, interests), and activity data needed to operate chat
						and matchmaking.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">2. How we use it</h2>
					<p className="text-muted-foreground">
						To run the service, match you with other users, moderate the
						platform, and keep Lume safe. We don't sell your personal data.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">3. Chats & messages</h2>
					<p className="text-muted-foreground">
						Chat messages are stored to support the experience and for
						moderation review when reports are filed. Reports include the room
						ID and the time of the report.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">4. Reports & blocks</h2>
					<p className="text-muted-foreground">
						When you report or block someone, we record who was involved so we
						can act on it. Blocks are mutual — neither side is notified.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">5. Your choices</h2>
					<p className="text-muted-foreground">
						You can update your profile, unblock users, or delete your account
						from settings. Contact us for data requests.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">6. Security</h2>
					<p className="text-muted-foreground">
						We use industry-standard practices, but no system is perfectly
						secure. Please don't share sensitive personal info in chats.
					</p>
				</section>

				<p className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
					This is a placeholder document. Final privacy copy will be published
					before general availability.
				</p>
			</div>
		</article>
	);
}
