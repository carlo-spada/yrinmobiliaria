import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/utils/LanguageContext';
import { MapPinned, Users, FileCheck } from 'lucide-react';

export function WhyChooseUs() {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: MapPinned,
      title: t.whyUs.local.title,
      description: t.whyUs.local.description,
      delay: 0,
    },
    {
      icon: Users,
      title: t.whyUs.personalized.title,
      description: t.whyUs.personalized.description,
      delay: 100,
    },
    {
      icon: FileCheck,
      title: t.whyUs.transparent.title,
      description: t.whyUs.transparent.description,
      delay: 200,
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t.whyUs.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t.whyUs.subtitle}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${benefit.delay}ms` }}
              >
                <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
