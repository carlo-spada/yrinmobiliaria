import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProperties } from '@/hooks/useProperties';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveImage } from '@/components/ResponsiveImage';

export function ZonesSection() {
  const { t, language } = useLanguage();
  const { data: properties = [] } = useProperties();

  // Fetch zones from database
  const { data: zones = [], isLoading } = useQuery({
    queryKey: ['service-zones-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_zones')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Don't render if no active zones
  if (!isLoading && zones.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-neutral">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t.zones.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t.zones.subtitle}
          </p>
        </div>

        {/* Zones Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[4/3] rounded-lg" />
            ))
          ) : (
            zones.map((zone, index) => {
              const zoneName = language === 'es' ? zone.name_es : zone.name_en;
              const zoneProperties = properties.filter(p =>
                p.location.zone === zone.name_es || p.location.zone === zone.name_en
              );

              // Fallback image if none set
              const imageUrl = zone.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop';

              return (
                <div
                  key={zone.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <ResponsiveImage
                        src={imageUrl}
                        alt={zoneName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-5 w-5" />
                          <h3 className="text-xl font-bold">{zoneName}</h3>
                        </div>
                        <p className="text-sm text-white/90">
                          {zoneProperties.length} {t.zones.properties}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
