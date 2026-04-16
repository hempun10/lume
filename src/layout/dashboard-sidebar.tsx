import { Link, useLocation } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Home, Settings } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarNavItem {
	label: string;
	to: "/dashboard" | "/settings";
	icon: LucideIcon;
}

const sidebarNav: SidebarNavItem[] = [
	{ label: "Lobby", to: "/dashboard", icon: Home },
	{ label: "Settings", to: "/settings", icon: Settings },
];

export { sidebarNav, type SidebarNavItem };

export function DashboardSidebar() {
	const { pathname } = useLocation();

	return (
		<aside className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r border-border/50 bg-background py-3 md:flex">
			{sidebarNav.map((item) => {
				const isActive =
					item.to === "/dashboard"
						? pathname === "/dashboard"
						: pathname.startsWith(item.to);
				return (
					<Tooltip key={item.label}>
						<TooltipTrigger asChild>
							<Link
								to={item.to}
								className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
									isActive
										? "bg-primary text-primary-foreground"
										: "text-muted-foreground hover:bg-accent hover:text-foreground"
								}`}
							>
								<item.icon className="h-5 w-5" />
							</Link>
						</TooltipTrigger>
						<TooltipContent side="right">{item.label}</TooltipContent>
					</Tooltip>
				);
			})}
		</aside>
	);
}
