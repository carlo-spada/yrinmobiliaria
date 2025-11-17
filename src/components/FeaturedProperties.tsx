import { PropertyCard } from '@/components/PropertyCard';
import { PropertyGridSkeleton } from '@/components/ui/skeleton-loader';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/utils/LanguageContext';
import { useProperties } from '@/hooks/useProperties';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function FeaturedProperties() {
  const { t, language } = useLanguage();
  const { data: properties = [], isLoading } = useProperties({ featured: true });
  const featuredProperties = properties.slice(0, 6);

  // Don't render if no featured properties
  if (!isLoading && featuredProperties.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t.featured.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t.featured.subtitle}
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {isLoading ? (
            <PropertyGridSkeleton count={6} />
          ) : (
            featuredProperties.map((property, index) => (
            <div
              key={property.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <PropertyCard
                id={property.id}
                image={property.images[0]}
                title={property.title[language]}
                price={new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                  minimumFractionDigits: 0,
                }).format(property.price)}
                location={`${property.location.neighborhood}, ${property.location.zone}`}
                bedrooms={property.features.bedrooms || 0}
                bathrooms={property.features.bathrooms}
                area={property.features.constructionArea}
                featured={property.featured}
                status={property.operation === 'venta' ? 'sale' : 'rent'}
              />
            </div>
          ))
          )}
        </div>

        {/* View All Button */}
        <div className="text-center animate-in fade-in duration-700 delay-500">
          <Link to="/propiedades">
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
            >
              {t.featured.viewAll}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
