import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useProperties } from '@/hooks/useProperties';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { PropertyCard } from '@/components/PropertyCard';
import { AlertCircle, Heart, Mail, Phone, Check, LogOut, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/utils/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

export default function UserDashboard() {
  const { user, signOut, profile } = useAuth();
  const { favorites: favoriteIds } = useFavorites();
  const { data: allProperties = [] } = useProperties();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  const [lastResendTime, setLastResendTime] = useState<number>(0);

  // Redirect if not authenticated
  if (!user) {
    navigate('/auth');
    return null;
  }

  const favoriteProperties = allProperties.filter((p) => favoriteIds.includes(p.id));
  const isEmailVerified = user.email_confirmed_at !== null;
  const canResend = Date.now() - lastResendTime > 60000; // 60 seconds cooldown

  const initials = (profile?.display_name || user.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const handleResendVerification = async () => {
    if (!canResend) {
      toast.error(
        language === 'es'
          ? 'Por favor espera 60 segundos antes de reenviar'
          : 'Please wait 60 seconds before resending'
      );
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email || '',
      });

      if (error) throw error;

      toast.success(
        language === 'es'
          ? 'Email de confirmación enviado! Revisa tu bandeja de entrada'
          : 'Confirmation email sent! Check your inbox'
      );
      setLastResendTime(Date.now());
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;
      
      toast.success(
        language === 'es' ? 'Cuenta eliminada exitosamente' : 'Account deleted successfully'
      );
      await signOut();
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-20 w-20 ring-2 ring-primary/20">
              <AvatarImage src={profile?.photo_url || ''} alt={profile?.display_name || 'User'} />
              <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">
                {language === 'es' ? 'Hola' : 'Hello'}, {profile?.display_name || user.email}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{user.email}</span>
                {isEmailVerified ? (
                  <Badge variant="default" className="bg-green-600">
                    <Check className="mr-1 h-3 w-3" />
                    {language === 'es' ? 'Verificado' : 'Verified'}
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {language === 'es' ? 'Pendiente' : 'Pending'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Email Verification Banner */}
        {!isEmailVerified && (
          <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {language === 'es'
                ? 'Por favor confirma tu correo electrónico. Sin confirmación, tus favoritos solo se guardarán localmente.'
                : 'Please confirm your email address. Without confirmation, your favorites will only be saved locally.'}
              <Button
                variant="link"
                size="sm"
                onClick={handleResendVerification}
                disabled={isResending || !canResend}
                className="ml-2 h-auto p-0 text-yellow-900 dark:text-yellow-100"
              >
                {isResending
                  ? language === 'es'
                    ? 'Enviando...'
                    : 'Sending...'
                  : language === 'es'
                  ? 'Reenviar email'
                  : 'Resend email'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Favorites Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Heart className="h-6 w-6 text-primary" />
                  {language === 'es' ? 'Tus Favoritos' : 'Your Favorites'}
                </h2>
                <Link to="/favoritos">
                  <Button variant="ghost" size="sm">
                    {language === 'es' ? 'Ver todos →' : 'View all →'}
                  </Button>
                </Link>
              </div>

              {favoriteProperties.length > 0 ? (
                <>
                  <p className="text-muted-foreground mb-4">
                    {language === 'es'
                      ? `Tienes ${favoriteProperties.length} ${
                          favoriteProperties.length === 1 ? 'propiedad guardada' : 'propiedades guardadas'
                        }`
                      : `You have ${favoriteProperties.length} saved ${
                          favoriteProperties.length === 1 ? 'property' : 'properties'
                        }`}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {favoriteProperties.slice(0, 4).map((property) => {
                      const title = property.title[language];
                      const image = property.images?.[0] || '';
                      const location = `${property.location.neighborhood || ''}, ${property.location.zone}`;

                      return (
                        <PropertyCard
                          key={property.id}
                          id={property.id}
                          image={image}
                          title={title}
                          price={`$${property.price.toLocaleString()}`}
                          location={location}
                          bedrooms={property.features.bedrooms}
                          bathrooms={property.features.bathrooms}
                          area={property.features.constructionArea}
                          featured={property.featured}
                          status={property.operation === 'venta' ? 'sale' : 'rent'}
                          variants={property.imageVariants?.[0]?.variants}
                        />
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 bg-muted rounded-lg">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {language === 'es'
                      ? 'Aún no tienes propiedades favoritas'
                      : "You don't have any favorite properties yet"}
                  </p>
                  <Link to="/propiedades">
                    <Button variant="default">
                      {language === 'es' ? 'Explorar propiedades →' : 'Explore properties →'}
                    </Button>
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'es' ? 'Tu Perfil' : 'Your Profile'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{language === 'es' ? 'Nombre' : 'Name'}</Label>
                  <Input value={profile?.display_name || user.email || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="flex items-center gap-2">
                    <Input value={user.email || ''} disabled />
                    {isEmailVerified && <Check className="h-4 w-4 text-green-600" />}
                  </div>
                </div>
                {profile?.phone && (
                  <div className="space-y-2">
                    <Label>{language === 'es' ? 'Teléfono' : 'Phone'}</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Input value={profile.phone} disabled />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'es' ? 'Cuenta' : 'Account'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {language === 'es' ? 'Cerrar sesión' : 'Sign out'}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" />
                      {language === 'es' ? 'Eliminar cuenta' : 'Delete account'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {language === 'es' ? '¿Estás seguro?' : 'Are you sure?'}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {language === 'es'
                          ? 'Esta acción no se puede deshacer. Se eliminarán permanentemente tu cuenta y todos tus datos.'
                          : 'This action cannot be undone. This will permanently delete your account and all your data.'}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {language === 'es' ? 'Cancelar' : 'Cancel'}
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive">
                        {language === 'es' ? 'Eliminar cuenta' : 'Delete account'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
