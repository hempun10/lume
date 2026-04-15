import { Link, useLocation } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
	Gamepad2,
	Home,
	LogOut,
	MessageCircle,
	Settings,
	Sparkles,
	User,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/features/auth";
import { ThemeToggle } from "@/features/theme";

interface SidebarNavItem {
	label: string;
	to: string;
	icon: LucideIcon;
}

const sidebarNav: SidebarNavItem[] = [
	{ label: "Lobby", to: "/dashboard", icon: Home },
	{ label: "Chat", to: "/chat", icon: MessageCircle },
	{ label: "Games", to: "/games", icon: Gamepad2 },
	{ label: "Settings", to: "/settings", icon: Settings },
];

export function DashboardTopBar() {
	const { user } = useAuth();
	const initials = user?.user_metadata?.display_name
		? (user.user_metadata.display_name as string)
				.split(" ")
				.map((n: string) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: (user?.email?.[0]?.toUpperCase() ?? "U");

	return (
		<header className="flex h-12 shrink-0 items-center justify-between border-b border-border/50 bg-background px-4">
			{/* Logo */}
			<Link to="/dashboard" className="flex items-center gap-2">
				<div className="flex h-6 w-6 items-center justify-center rounded-lg bg-foreground">
					<Sparkles className="h-3.5 w-3.5 text-background" />
				</div>
				<span className="text-sm font-semibold text-foreground">Lume</span>
			</Link>

			{/* Center: online indicator */}
			<div className="flex items-center gap-2">
				<span className="relative flex h-2 w-2">
					<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
					<span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
				</span>
				<span className="text-xs text-muted-foreground">Online</span>
			</div>

			{/* Right: theme toggle + user menu */}
			<div className="flex items-center gap-1">
				<ThemeToggle />
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 rounded-full"
						>
							<Avatar size="sm">
								<AvatarFallback className="text-[10px]">
									{initials}
								</AvatarFallback>
							</Avatar>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48">
						<div className="px-2 py-1.5">
							<p className="text-sm font-medium text-foreground">
								{(user?.user_metadata?.display_name as string) ?? "User"}
							</p>
							<p className="truncate text-xs text-muted-foreground">
								{user?.email}
							</p>
						</div>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<a href="/settings" className="cursor-pointer">
								<User className="mr-2 h-4 w-4" />
								Profile
							</a>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Link to="/logout" className="cursor-pointer">
								<LogOut className="mr-2 h-4 w-4" />
								Log out
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}

export function DashboardSidebar() {
	const { pathname } = useLocation();

	return (
		<aside className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border/50 bg-background py-3">
			{sidebarNav.map((item) => {
				const isActive = pathname === item.to;
				return (
					<Tooltip key={item.label}>
						<TooltipTrigger asChild>
							<a
								href={item.to}
								className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
									isActive
										? "bg-primary text-primary-foreground"
										: "text-muted-foreground hover:bg-accent hover:text-foreground"
								}`}
							>
								<item.icon className="h-5 w-5" />
							</a>
						</TooltipTrigger>
						<TooltipContent side="right">{item.label}</TooltipContent>
					</Tooltip>
				);
			})}
		</aside>
	);
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex h-screen flex-col">
			<DashboardTopBar />
			<div className="flex flex-1 overflow-hidden">
				<DashboardSidebar />
				<main className="flex-1 overflow-y-auto p-6">{children}</main>
			</div>
		</div>
	);
}
