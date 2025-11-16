import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, Trash2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { properties } from '@/data/properties';
import { useTranslation } from 'react-i18next';
import { FadeIn } from '@/components/animations/FadeIn';
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Favorites() {
  const { t, i18n } = useTranslation();
  const { favorites, clearFavorites } = useFavorites();
  const [viewMode] = useState<'grid' | 'list'>('grid');

  const favoriteProperties = properties.filter(property =>
    favorites.includes(property.id)
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <FadeIn>
          <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 md:py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Heart className="h-8 w-8 text-primary fill-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  {t('favorites.title', 'Mis Favoritos')}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {t('favorites.subtitle', 'Propiedades que has guardado para revisar después')}
                </p>
                <div className="flex items-center justify-center gap-4 pt-4">
                  <Link to="/propiedades">
                    <Button variant="outline">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      {t('favorites.backToProperties', 'Ver más propiedades')}
                    </Button>
                  </Link>
                  {favorites.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline">
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('favorites.clearAll', 'Limpiar todo')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t('favorites.clearConfirmTitle', '¿Eliminar todos los favoritos?')}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('favorites.clearConfirmDesc', 'Esta acción no se puede deshacer. Se eliminarán todas las propiedades de tu lista de favoritos.')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {t('common.cancel', 'Cancelar')}
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={clearFavorites}>
                            {t('favorites.clearAll', 'Limpiar todo')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Properties Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {favoriteProperties.length === 0 ? (
              <FadeIn>
                <div className="max-w-lg mx-auto text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted">
                    <Heart className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t('favorites.empty', 'No tienes favoritos aún')}
                  </h2>
                  <p className="text-muted-foreground">
                    {t('favorites.emptyDesc', 'Explora nuestro catálogo y guarda las propiedades que más te gusten.')}
                  </p>
                  <Link to="/propiedades">
                    <Button variant="primary">
                      {t('favorites.exploreCatalog', 'Explorar catálogo')}
                    </Button>
                  </Link>
                </div>
              </FadeIn>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-muted-foreground">
                    {favoriteProperties.length} {t('favorites.countLabel', 'propiedades guardadas')}
                  </p>
                </div>

                <StaggerContainer>
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'space-y-6'
                    }
                  >
                    {favoriteProperties.map((property) => (
                      <StaggerItem key={property.id}>
                        <PropertyCard
                          id={property.id}
                          image={property.images[0]}
                          title={property.title[i18n.language as 'es' | 'en']}
                          price={`$${property.price.toLocaleString()}`}
                          location={property.location.address}
                          bedrooms={property.features.bedrooms}
                          bathrooms={property.features.bathrooms}
                          area={property.features.constructionArea}
                          featured={property.featured}
                          status={property.operation as 'sale' | 'rent'}
                        />
                      </StaggerItem>
                    ))}
                  </div>
                </StaggerContainer>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
