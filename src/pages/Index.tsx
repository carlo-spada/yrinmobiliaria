import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { FeaturedProperties } from '@/components/FeaturedProperties';
import { ZonesSection } from '@/components/ZonesSection';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { StatsSection } from '@/components/StatsSection';
import { FinalCTA } from '@/components/FinalCTA';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
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
