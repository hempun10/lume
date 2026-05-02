import { Link } from "@tanstack/react-router";
import { LogOut, User } from "lucide-react";
import { LumeLogo } from "@/components/brand/lume-logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth";
import { ThemeToggle } from "@/features/theme";

export function DashboardTopbar() {
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
				<LumeLogo className="h-5 w-5 text-foreground" />
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
							aria-label="Open account menu"
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
							<Link to="/settings" className="cursor-pointer">
								<User className="mr-2 h-4 w-4" />
								Profile
							</Link>
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
