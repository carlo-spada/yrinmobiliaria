import { lazy, Suspense } from 'react';

import { FeaturedProperties } from '@/components/FeaturedProperties';
import { HeroSection } from '@/components/HeroSection';
import { PageLayout } from '@/components/layout';
import { LazySection } from '@/components/LazySection';
import { Skeleton } from '@/components/ui/skeleton';


// Lazy load below-the-fold sections for better initial page load
const ZonesSection = lazy(() => import('@/components/ZonesSection').then(m => ({ default: m.ZonesSection })));
const WhyChooseUs = lazy(() => import('@/components/WhyChooseUs').then(m => ({ default: m.WhyChooseUs })));
const StatsSection = lazy(() => import('@/components/StatsSection').then(m => ({ default: m.StatsSection })));
const FinalCTA = lazy(() => import('@/components/FinalCTA').then(m => ({ default: m.FinalCTA })));

const SectionFallback = () => (
  <div className="py-20">
    <div className="container mx-auto px-4 lg:px-8">
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);

const Index = () => {
  return (
    <PageLayout fullHeight>
      <HeroSection />
      <FeaturedProperties />

      {/* Lazy load below-the-fold sections */}
      <LazySection>
        <Suspense fallback={<SectionFallback />}>
          <ZonesSection />
        </Suspense>
      </LazySection>

      <LazySection>
        <Suspense fallback={<SectionFallback />}>
          <WhyChooseUs />
        </Suspense>
      </LazySection>

      <LazySection>
        <Suspense fallback={<SectionFallback />}>
          <StatsSection />
        </Suspense>
      </LazySection>

      <LazySection>
        <Suspense fallback={<SectionFallback />}>
          <FinalCTA />
        </Suspense>
      </LazySection>
    </PageLayout>
  );
};

export default Index;
