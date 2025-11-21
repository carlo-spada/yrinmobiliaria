import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, Calendar, MapPin, Phone, Mail, Heart, User, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LanguageSelector } from './LanguageSelectorNew';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useLanguage } from '@/utils/LanguageContext';
import { useServiceZones } from '@/hooks/useServiceZones';
import { useAuth } from '@/hooks/useAuth';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { count: favoritesCount } = useFavorites();
  const { getSetting } = useSiteSettings();
  const { zones: dbZones } = useServiceZones();
  const { user, profile, signOut } = useAuth();
  
  const companyName = getSetting('company_name', 'YR Inmobiliaria');

  const initials = (profile?.display_name || user?.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const propertyTypes = [
    { label: t.propertyTypes.houses, value: 'casa', icon: '🏠' },
    { label: t.propertyTypes.apartments, value: 'departamento', icon: '🏢' },
    { label: t.propertyTypes.commercial, value: 'local', icon: '🏪' },
  ];

  const zones = dbZones;

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={cn(
        'transition-all duration-300',
        isScrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-background/80 backdrop-blur-sm'
      )}
    >
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-2xl font-bold text-primary-foreground">
                {String(companyName).split(' ')[0].substring(0, 2).toUpperCase()}
              </span>
            </div>
            <span className="hidden sm:block text-xl font-semibold text-foreground">
              {String(companyName).split(' ').slice(1).join(' ') || companyName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors rounded-md',
                isActive('/')
                  ? 'text-primary bg-primary/10'
                  : 'text-foreground hover:text-primary hover:bg-muted'
              )}
            >
              {t.nav.home}
            </Link>

            {/* Properties Dropdown */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-10 px-4">
                    {t.nav.properties}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 w-[400px] bg-background">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-foreground">
                          {t.propertyTypes.title}
                        </h4>
                        <div className="grid gap-2">
                          {propertyTypes.map((type) => (
                            <Link
                              key={type.value}
                              to={`/propiedades?type=${type.value}`}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
                            >
                              <span className="text-2xl">{type.icon}</span>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground group-hover:text-primary">
                                  {type.label}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                      <Separator />
                      <Link
                        to="/propiedades"
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group"
                      >
                        <span className="text-sm font-medium text-foreground group-hover:text-primary">
                          {t.propertyTypes.viewAll}
                        </span>
                        <ChevronDown className="h-4 w-4 rotate-[-90deg] text-muted-foreground group-hover:text-primary" />
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link
              to="/mapa"
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors rounded-md',
                isActive('/mapa')
                  ? 'text-primary bg-primary/10'
                  : 'text-foreground hover:text-primary hover:bg-muted'
              )}
            >
              {t.nav.map}
            </Link>

            <Link
              to="/agentes"
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors rounded-md',
                isActive('/agentes')
                  ? 'text-primary bg-primary/10'
                  : 'text-foreground hover:text-primary hover:bg-muted'
              )}
            >
              {language === 'es' ? 'Agentes' : 'Agents'}
            </Link>

            <Link
              to="/nosotros"
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors rounded-md',
                isActive('/nosotros')
                  ? 'text-primary bg-primary/10'
                  : 'text-foreground hover:text-primary hover:bg-muted'
              )}
            >
              {t.nav.about}
            </Link>

            <Link
              to="/contacto"
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors rounded-md',
                isActive('/contacto')
                  ? 'text-primary bg-primary/10'
                  : 'text-foreground hover:text-primary hover:bg-muted'
              )}
            >
              {t.nav.contact}
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Favorites Button */}
            <Link to="/favoritos" className="hidden md:block relative">
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

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.photo_url || ''} alt={profile?.display_name || 'User'} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background z-50">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.display_name || user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/cuenta" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      {language === 'es' ? 'Mi Cuenta' : 'My Account'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/favoritos" className="cursor-pointer">
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
              <Link to="/auth" className="hidden md:block">
                <Button variant="outline" size="sm">
                  {language === 'es' ? 'Iniciar Sesión' : 'Sign In'}
                </Button>
              </Link>
            )}

            <LanguageSelector />
            
            <Link to="/agendar" className="hidden md:block">
              <Button size="sm" className="gap-2">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                {t.header.scheduleVisit}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button 
                  variant="ghost" 
                  size="icon"
                  aria-label={isMobileMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
                  title={isMobileMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="h-6 w-6" aria-hidden="true" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold text-primary-foreground">YR</span>
                    </div>
                    <span className="text-lg font-semibold">{companyName}</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-6 mt-8">
                  {/* Mobile Navigation Links */}
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'px-4 py-3 text-base font-medium rounded-lg transition-colors',
                        isActive('/')
                          ? 'text-primary bg-primary/10'
                          : 'text-foreground hover:bg-muted'
                      )}
                    >
                      {t.nav.home}
                    </Link>

                    <div className="space-y-1">
                      <div className="px-4 py-2 text-sm font-semibold text-muted-foreground">
                        {t.nav.properties}
                      </div>
                      {propertyTypes.map((type) => (
                        <Link
                          key={type.value}
                          to={`/propiedades?type=${type.value}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 ml-4 text-sm rounded-lg hover:bg-muted transition-colors"
                        >
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </Link>
                      ))}
                      <Link
                        to="/propiedades"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 ml-4 text-sm rounded-lg hover:bg-muted transition-colors font-medium"
                      >
                        {t.propertyTypes.viewAll}
                      </Link>
                    </div>

                    <Link
                      to="/mapa"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'px-4 py-3 text-base font-medium rounded-lg transition-colors',
                        isActive('/mapa')
                          ? 'text-primary bg-primary/10'
                        : 'text-foreground hover:bg-muted'
                      )}
                    >
                      {t.nav.map}
                    </Link>

                    <Link
                      to="/nosotros"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'px-4 py-3 text-base font-medium rounded-lg transition-colors',
                        isActive('/nosotros')
                          ? 'text-primary bg-primary/10'
                          : 'text-foreground hover:bg-muted'
                      )}
                    >
                      {t.nav.about}
                    </Link>

                    <Link
                      to="/contacto"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'px-4 py-3 text-base font-medium rounded-lg transition-colors',
                        isActive('/contacto')
                          ? 'text-primary bg-primary/10'
                          : 'text-foreground hover:bg-muted'
                      )}
                    >
                      {t.nav.contact}
                    </Link>

                    <Link
                      to="/agentes"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'px-4 py-3 text-base font-medium rounded-lg transition-colors',
                        isActive('/agentes')
                          ? 'text-primary bg-primary/10'
                          : 'text-foreground hover:bg-muted'
                      )}
                    >
                      {language === 'es' ? 'Agentes' : 'Agents'}
                    </Link>
                  </div>

                  <Separator />

                  {/* User Menu - Mobile */}
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 px-4 py-3 bg-muted rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={profile?.photo_url || ''} alt={profile?.display_name || 'User'} />
                          <AvatarFallback className="text-sm bg-primary/10 text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{profile?.display_name || user.email}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <Link
                        to="/cuenta"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg hover:bg-muted transition-colors"
                      >
                        <User className="h-5 w-5" />
                        {language === 'es' ? 'Mi Cuenta' : 'My Account'}
                      </Link>
                      <Link
                        to="/favoritos"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg hover:bg-muted transition-colors"
                      >
                        <Heart className="h-5 w-5" />
                        {language === 'es' ? 'Mis Favoritos' : 'My Favorites'}
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg hover:bg-muted transition-colors w-full text-left"
                      >
                        <LogOut className="h-5 w-5" />
                        {language === 'es' ? 'Cerrar Sesión' : 'Sign Out'}
                      </button>
                    </div>
                  ) : (
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        {language === 'es' ? 'Iniciar Sesión' : 'Sign In'}
                      </Button>
                    </Link>
                  )}

                  <Separator />

                  {/* Schedule Visit CTA */}
                  <Link to="/agendar" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full gap-2">
                      <Calendar className="h-4 w-4" />
                      {t.header.scheduleVisit}
                    </Button>
                  </Link>

                  <Separator />

                  {/* Contact Info */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">
                      {t.footer.contact}
                    </h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <a href="tel:+529511234567" className="hover:text-primary">
                          +52 (951) 123-4567
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <a href="mailto:contacto@yrinmobiliaria.com" className="hover:text-primary">
                          contacto@yrinmobiliaria.com
                        </a>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <span>Oaxaca de Juárez, Oaxaca</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
