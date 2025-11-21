import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useProperties } from '@/hooks/useProperties';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Mail, AlertTriangle, CheckCircle2, LogOut, Trash2, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/utils/LanguageContext';

const profileSchema = z.object({
  display_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function UserDashboard() {
  const { user, signOut, profile } = useAuth();
  const { favorites } = useFavorites();
  const { data: properties = [] } = useProperties();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: profile?.display_name || '',
      phone: profile?.phone || '',
    },
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (profile) {
      reset({
        display_name: profile.display_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile, reset]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const favoriteProperties = properties.filter((property) =>
    favorites.includes(property.id)
  );

  const handleResendVerification = async () => {
    if (!user?.email) return;

    setIsResendingEmail(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;

      toast.success('Email enviado! Revisa tu bandeja de entrada');
      setResendCooldown(60);
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar el email');
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleUpdateProfile = async (data: ProfileFormData) => {
    if (!profile) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: data.display_name,
          phone: data.phone || null,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Perfil actualizado correctamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el perfil');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      // Delete user's profile and favorites (cascade)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Sign out after deletion
      await signOut();
      toast.success('Cuenta eliminada correctamente');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar la cuenta');
    }
  };

  const isEmailVerified = user?.email_confirmed_at != null;

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Hola, {profile?.display_name || user.email?.split('@')[0]}
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">{user.email}</p>
              {isEmailVerified ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verificado
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Pendiente
                </Badge>
              )}
            </div>
          </div>

          {/* Email Verification Banner */}
          {!isEmailVerified && (
            <Alert className="mb-8 border-yellow-500/50 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="flex items-center justify-between gap-4">
                <span className="text-sm">
                  Por favor confirma tu correo electrónico. Sin confirmación, tus favoritos solo se guardarán localmente.
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResendVerification}
                  disabled={isResendingEmail || resendCooldown > 0}
                >
                  {resendCooldown > 0 ? `${resendCooldown}s` : 'Reenviar email'}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile & Favorites */}
            <div className="lg:col-span-2 space-y-8">
              {/* Favorites Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Mis Favoritos
                  </CardTitle>
                  <CardDescription>
                    Tienes {favoriteProperties.length} {favoriteProperties.length === 1 ? 'propiedad guardada' : 'propiedades guardadas'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {favoriteProperties.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Aún no tienes propiedades favoritas
                      </p>
                      <Link to="/propiedades">
                        <Button variant="primary" className="gap-2">
                          Explorar propiedades
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        {favoriteProperties.slice(0, 4).map((property) => (
                          <PropertyCard
                            key={property.id}
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
                        ))}
                      </div>
                      {favoriteProperties.length > 4 && (
                        <Link to="/favoritos">
                          <Button variant="outline" className="w-full">
                            Ver todos los favoritos ({favoriteProperties.length})
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Profile Settings */}
            <div className="space-y-6">
              {/* Profile Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Mi Perfil</CardTitle>
                  <CardDescription>Actualiza tu información personal</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(handleUpdateProfile)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="display_name">Nombre</Label>
                      <Input
                        id="display_name"
                        {...register('display_name')}
                        placeholder="Tu nombre"
                      />
                      {errors.display_name && (
                        <p className="text-sm text-destructive">{errors.display_name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          value={user.email || ''}
                          disabled
                          className="pr-10"
                        />
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono (opcional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        {...register('phone')}
                        placeholder="+52 (951) 123-4567"
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isUpdating}>
                      {isUpdating ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Acciones de cuenta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full gap-2">
                        <Trash2 className="h-4 w-4" />
                        Eliminar cuenta
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar cuenta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminarán permanentemente tu cuenta, favoritos y toda tu información.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
