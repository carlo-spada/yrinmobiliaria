import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { FeaturedProperties } from '@/components/FeaturedProperties';
import { LazySection } from '@/components/LazySection';
import { Footer } from '@/components/Footer';
import { MetaTags } from '@/components/seo/MetaTags';
import { StructuredData } from '@/components/seo/StructuredData';
import { getOrganizationSchema, getLocalBusinessSchema } from '@/lib/schema-helpers';
import { useLanguage } from '@/utils/LanguageContext';
import { lazy, Suspense } from 'react';
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
  const { language } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta Tags */}
      <MetaTags
        title="YR Inmobiliaria - Bienes Raíces en Oaxaca"
        description={language === 'es' 
          ? 'Expertos en bienes raíces en Oaxaca, México. Encuentra tu hogar perfecto con más de 10 años de experiencia.'
          : 'Real estate experts in Oaxaca, Mexico. Find your perfect home with over 10 years of experience.'}
        type="website"
      />
      
      {/* Structured Data */}
      <StructuredData type="Organization" data={getOrganizationSchema(language)} />
      <StructuredData type="LocalBusiness" data={getLocalBusinessSchema(language)} />
      
      <Header />
      <main>
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
      </main>
      <Footer />
    </div>
  );
};

export default Index;
