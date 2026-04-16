import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import { MobileTabBar } from "./mobile-tab-bar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex h-dvh flex-col">
			<DashboardTopbar />
			<div className="flex flex-1 overflow-hidden">
				<DashboardSidebar />
				<main className="flex-1 overflow-y-auto">{children}</main>
			</div>
			<MobileTabBar />
		</div>
	);
}
