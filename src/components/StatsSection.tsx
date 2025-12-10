import { Building2, Users, Calendar } from 'lucide-react';

import { useLanguage } from '@/contexts/LanguageContext';

export function StatsSection() {
  const { t } = useLanguage();

  const stats = [
    {
      icon: Building2,
      value: '200+',
      label: t.stats.propertiesSold,
      delay: 0,
    },
    {
      icon: Users,
      value: '150+',
      label: t.stats.happyClients,
      delay: 100,
    },
    {
      icon: Calendar,
      value: '10+',
      label: t.stats.yearsExperience,
      delay: 200,
    },
  ];

  return (
    <section className="py-20 bg-neutral">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t.stats.title}
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${stat.delay}ms` }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                  <Icon className="h-10 w-10 text-primary" />
                </div>
                <div className="text-5xl md:text-6xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-lg text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
