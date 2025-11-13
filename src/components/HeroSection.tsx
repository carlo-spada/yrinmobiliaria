import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/utils/LanguageContext';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-oaxaca.jpg';

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Oaxaca Real Estate"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 via-secondary/60 to-primary/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 py-20 lg:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-6 lg:space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
            {t.hero.title}
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            {t.hero.subtitle}
          </p>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 gap-2"
            >
              {t.hero.cta}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative Element */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}
