import { Link } from "@tanstack/react-router";
import { LumeLogo } from "@/components/brand/lume-logo";

const footerLinks = {
	product: [
		{ label: "Start Chatting", href: "/login" },
		{ label: "Games", href: "/#games" },
		{ label: "Safety", href: "/#safety" },
	],
	resources: [
		{ label: "FAQ", href: "/#faq" },
		{ label: "Blog", href: "/blog" },
		{ label: "Help", href: "/help" },
	],
	company: [
		{ label: "About", href: "/about" },
		{ label: "Privacy", href: "/privacy" },
		{ label: "Terms", href: "/terms" },
	],
	compare: [{ label: "Omegle Alternative", href: "/compare/omegle" }],
};

export function Footer() {
	return (
		<footer>
			<div className="mx-auto mt-16 max-w-4xl border-t border-border px-6 pb-8 pt-16 sm:px-8 lg:px-10">
				<div className="grid grid-cols-2 gap-8 md:grid-cols-5">
					{/* Logo */}
					<div className="col-span-2 md:col-span-1">
						<Link to="/" className="flex items-center gap-2">
							<LumeLogo className="h-6 w-6 text-foreground" />
							<span className="font-semibold text-foreground">Lume</span>
						</Link>
					</div>

					{/* Product */}
					<div>
						<h3 className="text-sm font-semibold leading-6 text-foreground">
							Product
						</h3>
						<ul className="mt-6 space-y-4">
							{footerLinks.product.map((link) => (
								<li key={link.label}>
									<Link
										to={link.href}
										className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Resources */}
					<div>
						<h3 className="text-sm font-semibold leading-6 text-foreground">
							Resources
						</h3>
						<ul className="mt-6 space-y-4">
							{footerLinks.resources.map((link) => (
								<li key={link.label}>
									<Link
										to={link.href}
										className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Company */}
					<div>
						<h3 className="text-sm font-semibold leading-6 text-foreground">
							Company
						</h3>
						<ul className="mt-6 space-y-4">
							{footerLinks.company.map((link) => (
								<li key={link.label}>
									<Link
										to={link.href}
										className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Compare */}
					<div>
						<h3 className="text-sm font-semibold leading-6 text-foreground">
							Compare
						</h3>
						<ul className="mt-6 space-y-4">
							{footerLinks.compare.map((link) => (
								<li key={link.label}>
									<Link
										to={link.href}
										className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Bottom bar */}
				<div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
					<p className="text-xs leading-5 text-muted-foreground">
						&copy; {new Date().getFullYear()} Lume. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
