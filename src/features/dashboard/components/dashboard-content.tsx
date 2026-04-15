import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { DashboardContentProps } from "../types";

export function DashboardContent({ user }: DashboardContentProps) {
	const displayName =
		user?.user_metadata?.display_name ?? user?.email ?? "User";

	return (
		<div className="min-h-[calc(100vh-64px)] bg-muted p-6">
			<div className="max-w-2xl mx-auto">
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl">Welcome, {displayName}!</CardTitle>
						<CardDescription>{user?.email}</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">
							You are on a protected route. Only authenticated users can see
							this page.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
