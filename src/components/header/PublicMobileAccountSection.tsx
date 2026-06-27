import { Heart, LogOut, User } from 'lucide-react';


import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePublicSession } from '@/hooks/usePublicSession';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from '@/lib/router-compat';

interface PublicMobileAccountSectionProps {
  onNavigate?: () => void;
}

export function PublicMobileAccountSection({
  onNavigate,
}: PublicMobileAccountSectionProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, loading } = usePublicSession();

  const initials = (user?.email || 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onNavigate?.();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Link to="/favoritos" onClick={onNavigate}>
          <Button variant="outline" className="w-full">
            {language === 'es' ? 'Mis Favoritos' : 'My Favorites'}
          </Button>
        </Link>
        <Link to="/auth" onClick={onNavigate}>
          <Button variant="outline" className="w-full">
            {language === 'es' ? 'Iniciar Sesión' : 'Sign In'}
          </Button>
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-2">
        <Link to="/favoritos" onClick={onNavigate}>
          <Button variant="outline" className="w-full">
            {language === 'es' ? 'Mis Favoritos' : 'My Favorites'}
          </Button>
        </Link>
        <Link to="/auth" onClick={onNavigate}>
          <Button variant="outline" className="w-full">
            {language === 'es' ? 'Iniciar Sesión' : 'Sign In'}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 px-4 py-3 bg-muted rounded-lg">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="text-sm bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user.email}</p>
        </div>
      </div>
      <Link
        to="/cuenta"
        onClick={onNavigate}
        className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg hover:bg-muted transition-colors"
      >
        <User className="h-5 w-5" />
        {language === 'es' ? 'Mi Cuenta' : 'My Account'}
      </Link>
      <Link
        to="/favoritos"
        onClick={onNavigate}
        className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg hover:bg-muted transition-colors"
      >
        <Heart className="h-5 w-5" />
        {language === 'es' ? 'Mis Favoritos' : 'My Favorites'}
      </Link>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg hover:bg-muted transition-colors w-full text-left"
      >
        <LogOut className="h-5 w-5" />
        {language === 'es' ? 'Cerrar Sesión' : 'Sign Out'}
      </button>
    </div>
  );
}
