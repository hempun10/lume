import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu } from "lucide-react";
import { LumeLogo } from "@/components/brand/lume-logo";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/features/auth";
import { ThemeToggle } from "@/features/theme";

const navLinks = [
	{ label: "Features", href: "/#features" },
	{ label: "How it works", href: "/#how-it-works" },
	{ label: "FAQ", href: "/#faq" },
] as const;

export function LandingHeader() {
	const { session, isLoading } = useAuth();
	const isAuthenticated = !!session;
	const ctaSlot = isLoading ? (
		<div className="h-8 w-24 animate-pulse rounded-xl bg-muted" />
	) : isAuthenticated ? (
		<Button asChild size="sm" className="rounded-full">
			<Link to="/dashboard">Open App</Link>
		</Button>
	) : (
		<Button asChild size="sm" className="rounded-xl">
			<Link to="/login">
				Sign In
				<ArrowRight className="ml-1 h-3.5 w-3.5" />
			</Link>
		</Button>
	);

	const mobileCtaSlot = isLoading ? (
		<div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
	) : isAuthenticated ? (
		<SheetClose asChild>
			<Button asChild className="rounded-xl">
				<Link to="/dashboard">
					Dashboard
					<ArrowRight className="ml-1 h-3.5 w-3.5" />
				</Link>
			</Button>
		</SheetClose>
	) : (
		<SheetClose asChild>
			<Button asChild className="rounded-xl">
				<Link to="/login">
					Sign In
					<ArrowRight className="ml-1 h-3.5 w-3.5" />
				</Link>
			</Button>
		</SheetClose>
	);

	return (
		<header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-lg">
			<nav className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6 sm:px-8 lg:px-10">
				{/* Logo */}
				<Link to="/" className="flex items-center gap-2">
					<LumeLogo className="h-6 w-6 text-foreground" />
					<span className="font-semibold text-foreground">Lume</span>
				</Link>

				{/* Center nav links — desktop */}
				<div className="hidden items-center gap-1 md:flex">
					{navLinks.map((link) => (
						<a
							key={link.label}
							href={link.href}
							className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
						>
							{link.label}
						</a>
					))}
				</div>

				{/* Right side — desktop */}
				<div className="hidden items-center gap-2 md:flex">
					<ThemeToggle />
					{ctaSlot}
				</div>

				{/* Mobile: theme toggle + hamburger */}
				<div className="flex items-center gap-1 md:hidden">
					<ThemeToggle />
					<Sheet>
						<SheetTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								aria-label="Open menu"
							>
								<Menu className="h-5 w-5" />
							</Button>
						</SheetTrigger>
						<SheetContent side="right" showCloseButton>
							<SheetHeader>
								<SheetTitle>
									<Link to="/" className="flex items-center gap-2">
										<LumeLogo className="h-6 w-6 text-foreground" />
										<span className="font-semibold text-foreground">Lume</span>
									</Link>
								</SheetTitle>
							</SheetHeader>

							<nav className="flex flex-col gap-1 px-4">
								{navLinks.map((link) => (
									<SheetClose key={link.label} asChild>
										<a
											href={link.href}
											className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
										>
											{link.label}
										</a>
									</SheetClose>
								))}

								<hr className="my-2 border-border" />

								{mobileCtaSlot}
							</nav>
						</SheetContent>
					</Sheet>
				</div>
			</nav>
		</header>
	);
}
