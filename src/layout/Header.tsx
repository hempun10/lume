import { Link } from "@tanstack/react-router";
import {
	ArrowRight,
	Home,
	LayoutDashboard,
	LogIn,
	LogOut,
	Menu,
	Sparkles,
	X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/features/auth";

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);
	const { user, isLoading } = useAuth();

	return (
		<>
			<header className="sticky top-0 z-40 bg-background">
				<nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4 sm:px-8 lg:px-10">
					{/* Logo */}
					<Link to="/" className="flex items-center gap-2.5">
						<div className="relative flex h-7 w-7 items-center justify-center rounded-xl bg-gray-900">
							<Sparkles className="h-4 w-4 text-white" />
						</div>
						<span className="font-semibold text-gray-900">Lume</span>
					</Link>

					{/* Desktop nav */}
					<div className="hidden items-center gap-1 md:flex">
						{!isLoading && !user && (
							<>
								<Link
									to="/"
									className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 transition-all duration-300 hover:bg-black/5"
								>
									Home
								</Link>
								<Link
									to="/login"
									className="relative ml-2 inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-primary bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-xs transition-shadow hover:bg-primary/90"
								>
									Sign In
									<ArrowRight className="h-4 w-4" />
								</Link>
							</>
						)}
						{!isLoading && user && (
							<>
								<Link
									to="/dashboard"
									className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 transition-all duration-300 hover:bg-black/5"
								>
									Dashboard
								</Link>
								<Link
									to="/logout"
									className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 transition-all duration-300 hover:bg-black/5"
								>
									Log out
								</Link>
							</>
						)}
					</div>

					{/* Mobile menu button */}
					<button
						type="button"
						onClick={() => setIsOpen(!isOpen)}
						className="flex items-center justify-center rounded-xl px-2 py-2 transition-all duration-300 hover:bg-black/5 md:hidden"
						aria-label="Toggle menu"
					>
						<Menu className="h-5 w-5" />
					</button>
				</nav>
			</header>

			{/* Mobile overlay */}
			{isOpen && (
				<button
					type="button"
					className="fixed inset-0 z-40 bg-black/50"
					onClick={() => setIsOpen(false)}
					aria-label="Close menu"
				/>
			)}

			{/* Mobile sidebar */}
			<aside
				className={`fixed left-0 top-0 z-50 flex h-full w-80 transform flex-col border-r border-border bg-background shadow-2xl transition-transform duration-300 ease-in-out ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex items-center justify-between border-b border-border p-4">
					<div className="flex items-center gap-2.5">
						<div className="relative flex h-7 w-7 items-center justify-center rounded-xl bg-gray-900">
							<Sparkles className="h-4 w-4 text-white" />
						</div>
						<span className="font-semibold text-gray-900">Lume</span>
					</div>
					<button
						type="button"
						onClick={() => setIsOpen(false)}
						className="rounded-xl p-2 text-foreground transition-colors hover:bg-accent"
						aria-label="Close menu"
					>
						<X size={24} />
					</button>
				</div>

				<nav className="flex-1 overflow-y-auto p-4">
					<div className="flex flex-col gap-1">
						{!isLoading && !user && (
							<>
								<Link
									to="/"
									onClick={() => setIsOpen(false)}
									className="flex items-center gap-3 rounded-xl p-3 text-foreground transition-colors hover:bg-accent"
									activeProps={{
										className:
											"flex items-center gap-3 rounded-xl p-3 bg-brand-500 text-white transition-colors hover:bg-brand-600",
									}}
								>
									<Home size={20} />
									<span className="font-medium">Home</span>
								</Link>
								<Link
									to="/login"
									onClick={() => setIsOpen(false)}
									className="flex items-center gap-3 rounded-xl p-3 text-foreground transition-colors hover:bg-accent"
									activeProps={{
										className:
											"flex items-center gap-3 rounded-xl p-3 bg-brand-500 text-white transition-colors hover:bg-brand-600",
									}}
								>
									<LogIn size={20} />
									<span className="font-medium">Sign in</span>
								</Link>
							</>
						)}
						{!isLoading && user && (
							<>
								<Link
									to="/dashboard"
									onClick={() => setIsOpen(false)}
									className="flex items-center gap-3 rounded-xl p-3 text-foreground transition-colors hover:bg-accent"
									activeProps={{
										className:
											"flex items-center gap-3 rounded-xl p-3 bg-brand-500 text-white transition-colors hover:bg-brand-600",
									}}
								>
									<LayoutDashboard size={20} />
									<span className="font-medium">Dashboard</span>
								</Link>
								<Link
									to="/logout"
									onClick={() => setIsOpen(false)}
									className="flex items-center gap-3 rounded-xl p-3 text-foreground transition-colors hover:bg-accent"
								>
									<LogOut size={20} />
									<span className="font-medium">Log out</span>
								</Link>
							</>
						)}
					</div>
				</nav>
			</aside>
		</>
	);
}
