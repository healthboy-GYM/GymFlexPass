
'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { WhyAllpassSection } from '@/components/sections/WhyAllpassSection';
import { CoreValuesSection } from '@/components/sections/CoreValuesSection';
import { CTASection } from '@/components/sections/CTASection';
import { PassDetailsSection } from '@/components/sections/PassDetailsSection';
import { PopupHost } from '@/components/sections/PopupHost';
import { EventShowcase } from '@/components/sections/EventShowcase';
import { StatsStrip } from '@/components/sections/StatsStrip';
import { BranchMarquee } from '@/components/sections/BranchMarquee';
import { RouteFinderSection } from '@/components/sections/RouteFinderSection';

export default function HomePage() {
  return (
    <>
      <PopupHost />
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow">
          <HeroSection />
          <StatsStrip />
          <BranchMarquee />
          <EventShowcase />
          <WhyAllpassSection />
          <CoreValuesSection />
          <RouteFinderSection />
          <PassDetailsSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
}
