import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_landing/community-guidelines")({
	head: () => ({
		meta: [
			{ title: "Community Guidelines — Lume" },
			{
				name: "description",
				content: "The rules that keep Lume welcoming and safe for everyone.",
			},
		],
	}),
	component: CommunityGuidelinesPage,
});

function CommunityGuidelinesPage() {
	return (
		<article className="mx-auto max-w-3xl px-6 py-16 sm:px-8 lg:px-10">
			<header className="mb-10">
				<h1 className="text-4xl font-semibold tracking-tight text-foreground">
					Community Guidelines
				</h1>
				<p className="mt-3 text-sm text-muted-foreground">
					Short version: be a decent human. Long version below.
				</p>
			</header>

			<div className="space-y-8 text-foreground">
				<section className="space-y-3">
					<h2 className="text-xl font-semibold">Be respectful</h2>
					<p className="text-muted-foreground">
						Treat people the way you want to be treated. Harassment, threats,
						and hate speech are not tolerated.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">Keep it safe for work</h2>
					<p className="text-muted-foreground">
						No nudity, sexual content, or graphic violence. Lume is a general
						audience service.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">No minors</h2>
					<p className="text-muted-foreground">
						You must be 18 or older to use Lume. Report any account you believe
						belongs to a minor immediately.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">No spam or scams</h2>
					<p className="text-muted-foreground">
						Don't use Lume to advertise, phish, or promote schemes. Keep
						conversations genuine.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">Protect yourself</h2>
					<p className="text-muted-foreground">
						Don't share personal info (address, phone, financial details) with
						strangers. Use the report and block tools if something feels off.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">How we enforce</h2>
					<p className="text-muted-foreground">
						Reports are reviewed by our team. Depending on severity, we may warn
						users, remove content, or suspend accounts. Repeat or severe
						violations lead to permanent bans.
					</p>
				</section>

				<p className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
					This is a placeholder document. Full enforcement policy will be
					published before general availability.
				</p>
			</div>
		</article>
	);
}
