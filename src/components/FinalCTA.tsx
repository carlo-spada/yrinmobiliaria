import { Phone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export function FinalCTA() {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-neutral">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            {t.finalCta.title}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground">
            {t.finalCta.subtitle}
          </p>
          <div className="pt-4">
            <Button
              size="lg"
              variant="primary"
              className="gap-2 px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              <Phone className="h-5 w-5" />
              {t.finalCta.button}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
