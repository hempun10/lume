import { ComparisonSection } from "./components/comparison-section";
import { CtaSection } from "./components/cta-section";
import { FaqSection } from "./components/faq-section";
import { FeaturesSection } from "./components/features-section";
import { HeroSection } from "./components/hero-section";
import { HowItWorksSection } from "./components/how-it-works-section";
import { StatsSection } from "./components/stats-section";

export function LandingPage() {
	return (
		<div className="mx-auto max-w-5xl px-6 pb-20 sm:px-8 lg:px-10">
			<HeroSection />

			<hr className="my-20 border-t border-border" />

			<StatsSection />

			<hr className="my-20 border-t border-border" />

			<FeaturesSection />

			<hr className="my-20 border-t border-border" />

			<ComparisonSection />

			<hr className="my-20 border-t border-border" />

			<HowItWorksSection />

			<hr className="my-20 border-t border-border" />

			<FaqSection />

			<hr className="my-20 border-t border-border" />

			<CtaSection />
		</div>
	);
}
