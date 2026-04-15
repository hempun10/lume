import { Check, X } from "lucide-react";

const rows = [
	{
		feature: "Text chat",
		lume: "Always free, unlimited",
		lumePositive: true,
		others: "Free with ads / limited",
	},
	{
		feature: "Video required",
		lume: "Text-first, your choice",
		lumePositive: true,
		others: "Video-only or pushed",
	},
	{
		feature: "Built-in games",
		lume: "5+ multiplayer games",
		lumePositive: true,
		others: "None",
	},
	{
		feature: "Moderation",
		lume: "AI + human review",
		lumePositive: true,
		others: "Minimal or none",
	},
	{
		feature: "Anonymity",
		lume: "Anonymous by default",
		lumePositive: true,
		others: "Varies",
	},
	{
		feature: "Interest matching",
		lume: "Smart matching algorithm",
		lumePositive: true,
		others: "Random only",
	},
	{
		feature: "Mobile experience",
		lume: "Native-quality PWA",
		lumePositive: true,
		others: "Poor or no mobile app",
	},
	{
		feature: "Bots & spam",
		lume: "Actively filtered",
		lumePositive: true,
		others: "Rampant",
	},
];

export function ComparisonSection() {
	return (
		<section>
			<div className="mb-14">
				<h2 className="max-w-xl text-xl font-semibold leading-[1.2] tracking-tight text-foreground sm:text-2xl md:text-3xl">
					Not your average
					<br />
					random chat app
				</h2>
				<p className="mt-4 max-w-2xl text-pretty text-sm font-medium leading-relaxed text-muted-foreground">
					We built Lume because every alternative is either unsafe, outdated, or
					just plain boring. Here's how we compare.
				</p>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full max-w-4xl">
					<thead>
						<tr className="border-b border-border">
							<th className="py-3 pr-4 text-left text-sm font-medium text-foreground">
								Feature
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium text-foreground">
								Lume
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
								Omegle, Rumi & Others
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
									{row.lumePositive ? (
										<Check className="mr-2 inline h-4 w-4 text-green-600" />
									) : (
										<X className="mr-2 inline h-4 w-4 text-red-500" />
									)}
									{row.lume}
								</td>
								<td className="px-4 py-3 text-sm text-muted-foreground">
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
