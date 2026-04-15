import { createFileRoute, Outlet } from "@tanstack/react-router";
import Footer from "@/layout/Footer";
import { LandingHeader } from "@/layout/landing-header";

export const Route = createFileRoute("/_landing")({
	component: LandingLayout,
});

function LandingLayout() {
	return (
		<>
			<LandingHeader />
			<main className="min-h-screen">
				<Outlet />
			</main>
			<Footer />
		</>
	);
}
