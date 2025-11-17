import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { FeaturedProperties } from '@/components/FeaturedProperties';
import { ZonesSection } from '@/components/ZonesSection';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { StatsSection } from '@/components/StatsSection';
import { FinalCTA } from '@/components/FinalCTA';
import { Footer } from '@/components/Footer';
import { MetaTags } from '@/components/seo/MetaTags';
import { StructuredData, getOrganizationSchema, getLocalBusinessSchema } from '@/components/seo/StructuredData';
import { useLanguage } from '@/utils/LanguageContext';

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
        <ZonesSection />
        <WhyChooseUs />
        <StatsSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
