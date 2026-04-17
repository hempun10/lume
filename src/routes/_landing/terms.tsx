import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_landing/terms")({
	head: () => ({
		meta: [
			{ title: "Terms of Service — Lume" },
			{
				name: "description",
				content: "The terms and conditions for using Lume.",
			},
		],
	}),
	component: TermsPage,
});

function TermsPage() {
	return (
		<article className="mx-auto max-w-3xl px-6 py-16 sm:px-8 lg:px-10">
			<header className="mb-10">
				<h1 className="text-4xl font-semibold tracking-tight text-foreground">
					Terms of Service
				</h1>
				<p className="mt-3 text-sm text-muted-foreground">
					Last updated: {new Date().toLocaleDateString()}
				</p>
			</header>

			<div className="space-y-8 text-foreground">
				<section className="space-y-3">
					<h2 className="text-xl font-semibold">1. Acceptance of terms</h2>
					<p className="text-muted-foreground">
						By using Lume you agree to these terms. If you don't agree, please
						don't use the service.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">2. Eligibility</h2>
					<p className="text-muted-foreground">
						You must be at least 18 years old to use Lume. By creating an
						account you confirm that you meet this requirement.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">3. Acceptable use</h2>
					<p className="text-muted-foreground">
						You agree to follow our{" "}
						<a
							href="/community-guidelines"
							className="underline underline-offset-4 hover:text-foreground"
						>
							Community Guidelines
						</a>
						. Harassment, hate speech, sexually explicit content, and illegal
						activity are not allowed and will result in removal.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">4. Content</h2>
					<p className="text-muted-foreground">
						You're responsible for what you share. We may remove content or
						accounts that violate these terms.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">5. Changes</h2>
					<p className="text-muted-foreground">
						We may update these terms from time to time. Continued use of Lume
						after changes means you accept the updated terms.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">6. Contact</h2>
					<p className="text-muted-foreground">
						Questions about these terms? Reach out through the help page.
					</p>
				</section>

				<p className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
					This is a placeholder document. Final legal copy will be published
					before general availability.
				</p>
			</div>
		</article>
	);
}
