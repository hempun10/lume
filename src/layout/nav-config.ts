import type { LucideIcon } from "lucide-react";
import { Home, LayoutDashboard, LogIn, LogOut } from "lucide-react";

export interface NavItem {
	label: string;
	to: string;
	icon: LucideIcon;
	auth?: "guest" | "user";
}

export const navItems: NavItem[] = [
	{ label: "Home", to: "/", icon: Home, auth: "guest" },
	{ label: "Log in", to: "/login", icon: LogIn, auth: "guest" },
	{ label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, auth: "user" },
	{ label: "Log out", to: "/logout", icon: LogOut, auth: "user" },
];
