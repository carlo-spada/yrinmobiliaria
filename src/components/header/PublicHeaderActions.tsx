import { Heart, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFavorites } from '@/hooks/useFavorites';
import { usePublicSession } from '@/hooks/usePublicSession';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export function PublicHeaderActions() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { count: favoritesCount } = useFavorites();
  const { user, loading } = usePublicSession();

  const initials = (user?.email || 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <>
      <Link href="/favoritos" className="hidden md:block relative">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`${t.header.viewFavorites}${favoritesCount > 0 ? ` (${favoritesCount})` : ''}`}
          title={`${t.header.viewFavorites}${favoritesCount > 0 ? ` (${favoritesCount})` : ''}`}
        >
          <Heart
            className={cn(
              'h-5 w-5',
              favoritesCount > 0 && 'fill-red-500 text-red-500'
            )}
            aria-hidden="true"
          />
          {favoritesCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {favoritesCount}
            </Badge>
          )}
        </Button>
      </Link>

      {loading ? (
        <Link href="/auth" className="hidden md:block">
          <Button variant="outline" size="sm">
            {language === 'es' ? 'Iniciar Sesión' : 'Sign In'}
          </Button>
        </Link>
      ) : user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hidden md:flex rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-background z-50">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/cuenta" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                {language === 'es' ? 'Mi Cuenta' : 'My Account'}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/favoritos" className="cursor-pointer">
                <Heart className="mr-2 h-4 w-4" />
                {language === 'es' ? 'Mis Favoritos' : 'My Favorites'}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              {language === 'es' ? 'Cerrar Sesión' : 'Sign Out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link href="/auth" className="hidden md:block">
          <Button variant="outline" size="sm">
            {language === 'es' ? 'Iniciar Sesión' : 'Sign In'}
          </Button>
        </Link>
      )}
    </>
  );
}
