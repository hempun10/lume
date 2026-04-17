import { Check, X } from "lucide-react";

const rows = [
	{
		feature: "Video required",
		lume: "Text-first",
		others: "Video-first or forced",
	},
	{ feature: "Built-in games", lume: "5 playable today", others: "None" },
	{ feature: "Matching", lume: "Shared-interest", others: "Fully random" },
	{
		feature: "Moderation",
		lume: "AI on every message",
		others: "Minimal or reactive",
	},
	{
		feature: "Identity",
		lume: "Anonymous by default",
		others: "Mixed / exposed",
	},
	{ feature: "Bots & spam", lume: "Actively filtered", others: "Everywhere" },
	{
		feature: "Mobile",
		lume: "PWA, works everywhere",
		others: "Poor or desktop-only",
	},
	{
		feature: "Price",
		lume: "Free, forever",
		others: "Free with ads, or paywalled",
	},
];

export function ComparisonSection() {
	return (
		<section>
			<div className="mb-14">
				<h2 className="max-w-xl font-semibold text-xl leading-[1.2] tracking-tight text-foreground sm:text-2xl md:text-3xl">
					Not another clone of the old
					<br />
					random-chat apps
				</h2>
				<p className="mt-4 max-w-2xl text-pretty text-sm font-medium leading-relaxed text-muted-foreground">
					Omegle closed. Rumi and the rest are either unsafe, outdated, or
					boring. Here&rsquo;s what we do differently.
				</p>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full max-w-4xl">
					<thead>
						<tr className="border-b border-border">
							<th className="py-3 pr-4 text-left text-sm font-medium text-muted-foreground">
								Feature
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium text-foreground">
								Lume
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
								Other random-chat apps
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border">
						{rows.map((row) => (
							<tr key={row.feature}>
								<td className="py-3 pr-4 text-sm text-muted-foreground">
									{row.feature}
								</td>
								<td className="px-4 py-3 text-sm text-foreground">
									<Check className="mr-2 inline h-4 w-4 text-green-600" />
									{row.lume}
								</td>
								<td className="px-4 py-3 text-sm text-muted-foreground">
									<X className="mr-2 inline h-4 w-4 text-muted-foreground/60" />
									{row.others}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}
