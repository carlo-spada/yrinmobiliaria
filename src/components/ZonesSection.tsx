import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/utils/LanguageContext';
import { getPropertiesByZone } from '@/data/properties';
import { MapPin } from 'lucide-react';

const zones = [
  {
    id: 'centro',
    name: 'Centro Histórico',
    image: 'https://images.unsplash.com/photo-1555881290-491c65e84c41?w=800&h=600&fit=crop',
  },
  {
    id: 'reforma',
    name: 'Reforma San Felipe',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
  },
  {
    id: 'norte',
    name: 'Zona Norte',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop',
  },
  {
    id: 'valles',
    name: 'Valles Centrales',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
  },
];

export function ZonesSection() {
  const { t } = useLanguage();

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
          {zones.map((zone, index) => {
            const zoneProperties = getPropertiesByZone(zone.name);
            return (
              <div
                key={zone.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={zone.image}
                      alt={zone.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5" />
                        <h3 className="text-xl font-bold">{zone.name}</h3>
                      </div>
                      <p className="text-sm text-white/90">
                        {zoneProperties.length} {t.zones.properties}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
