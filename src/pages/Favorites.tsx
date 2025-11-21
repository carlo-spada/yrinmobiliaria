import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, Trash2, X, AlertCircle, Check } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFavorites } from '@/hooks/useFavorites';
import { useProperties } from '@/hooks/useProperties';
import { useLanguage } from '@/utils/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
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
  const { language, t } = useLanguage();
  const { favorites, clearFavorites } = useFavorites();
  const { data: properties = [] } = useProperties();
  const { user } = useAuth();
  const [viewMode] = useState<'grid' | 'list'>('grid');
  const [showSignupBanner, setShowSignupBanner] = useState(true);

  const favoriteProperties = properties.filter(property =>
    favorites.includes(property.id)
  );

  const isEmailVerified = user?.email_confirmed_at !== null;

  useEffect(() => {
    const dismissed = localStorage.getItem('dismissed-favorites-banner');
    if (dismissed) {
      setShowSignupBanner(false);
    }
  }, []);

  const dismissBanner = () => {
    localStorage.setItem('dismissed-favorites-banner', 'true');
    setShowSignupBanner(false);
  };

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
                  {language === 'es' ? 'Mis Favoritos' : 'My Favorites'}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {language === 'es' ? 'Propiedades que has guardado para revisar después' : 'Properties you have saved to review later'}
                </p>
                <div className="flex items-center justify-center gap-4 pt-4">
                  <Link to="/propiedades">
                    <Button variant="outline">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      {language === 'es' ? 'Ver más propiedades' : 'View more properties'}
                    </Button>
                  </Link>
                  {favorites.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline">
                          <Trash2 className="mr-2 h-4 w-4" />
                          {language === 'es' ? 'Limpiar todo' : 'Clear all'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {language === 'es' ? '¿Eliminar todos los favoritos?' : 'Remove all favorites?'}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {language === 'es' ? 'Esta acción no se puede deshacer. Se eliminarán todas las propiedades de tu lista de favoritos.' : 'This action cannot be undone. All properties will be removed from your favorites list.'}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {language === 'es' ? 'Cancelar' : 'Cancel'}
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={clearFavorites}>
                            {language === 'es' ? 'Limpiar todo' : 'Clear all'}
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

        {/* Signup/Verification Banners */}
        {showSignupBanner && (
          <section className="py-4">
            <div className="container mx-auto px-4">
              {!user ? (
                <Alert className="relative border-primary/50 bg-primary/5">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  <AlertDescription className="flex items-center justify-between gap-4 pr-8">
                    <span className="text-foreground">
                      {language === 'es'
                        ? '📱 Crea una cuenta para sincronizar tus favoritos entre dispositivos'
                        : '📱 Create an account to sync your favorites across devices'}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link to="/auth?mode=signup">
                        <Button size="sm" variant="default">
                          {language === 'es' ? 'Crear Cuenta' : 'Sign Up'}
                        </Button>
                      </Link>
                      <Link to="/auth?mode=login">
                        <Button size="sm" variant="outline">
                          {language === 'es' ? 'Iniciar Sesión' : 'Sign In'}
                        </Button>
                      </Link>
                    </div>
                  </AlertDescription>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={dismissBanner}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Alert>
              ) : !isEmailVerified ? (
                <Alert className="relative border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="flex items-center justify-between gap-4 pr-8">
                    <span className="text-foreground">
                      {language === 'es'
                        ? '⚠️ Confirma tu email para guardar tus favoritos en la nube'
                        : '⚠️ Confirm your email to save your favorites in the cloud'}
                    </span>
                    <Link to="/cuenta">
                      <Button size="sm" variant="outline">
                        {language === 'es' ? 'Ir a Mi Cuenta →' : 'Go to My Account →'}
                      </Button>
                    </Link>
                  </AlertDescription>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={dismissBanner}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Alert>
              ) : null}
            </div>
          </section>
        )}

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
                    {language === 'es' ? 'No tienes favoritos aún' : 'No favorites yet'}
                  </h2>
                  <p className="text-muted-foreground">
                    {language === 'es' ? 'Explora nuestro catálogo y guarda las propiedades que más te gusten.' : 'Browse our catalog and save the properties you like the most.'}
                  </p>
                  <Link to="/propiedades">
                    <Button variant="primary">
                      {language === 'es' ? 'Explorar catálogo' : 'Browse catalog'}
                    </Button>
                  </Link>
                </div>
              </FadeIn>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-muted-foreground">
                    {favoriteProperties.length} {language === 'es' ? 'propiedades guardadas' : 'saved properties'}
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
                          variants={property.imageVariants?.[0]?.variants}
                          title={property.title[language as 'es' | 'en']}
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
