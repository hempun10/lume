import { ComparisonSection } from "./components/comparison-section";
import { CtaSection } from "./components/cta-section";
import { FaqSection } from "./components/faq-section";
import { FeaturesSection } from "./components/features-section";
import { HeroSection } from "./components/hero-section";
import { HowItWorksSection } from "./components/how-it-works-section";
import { StatsSection } from "./components/stats-section";

export function LandingPage() {
	return (
		<div className="mx-auto max-w-4xl px-6 pb-20 sm:px-8 lg:px-10">
			<HeroSection />

			<hr className="my-20 border-t border-gray-100" />

			<StatsSection />

			<hr className="my-20 border-t border-gray-100" />

			<FeaturesSection />

			<hr className="my-20 border-t border-gray-100" />

			<ComparisonSection />

			<hr className="my-20 border-t border-gray-100" />

			<HowItWorksSection />

			<hr className="my-20 border-t border-gray-100" />

			<FaqSection />

			<hr className="my-20 border-t border-gray-100" />

			<CtaSection />
		</div>
	);
}
