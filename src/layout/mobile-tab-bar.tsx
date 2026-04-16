import { Link, useLocation } from "@tanstack/react-router";
import { sidebarNav } from "./dashboard-sidebar";

export function MobileTabBar() {
	const { pathname } = useLocation();

	return (
		<nav className="flex h-14 shrink-0 items-center justify-around border-t border-border/50 bg-background md:hidden">
			{sidebarNav.map((item) => {
				const isActive =
					item.to === "/dashboard"
						? pathname === "/dashboard"
						: pathname.startsWith(item.to);
				return (
					<Link
						key={item.label}
						to={item.to}
						className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
							isActive ? "text-primary" : "text-muted-foreground"
						}`}
					>
						<item.icon className="h-5 w-5" />
						<span className="text-[10px] font-medium">{item.label}</span>
					</Link>
				);
			})}
		</nav>
	);
}
