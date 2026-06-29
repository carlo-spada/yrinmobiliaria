import { Calendar, ChevronDown, Heart, Mail, MapPin, Menu, Phone, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { lazy, Suspense, useEffect, useState } from 'react';

import { LocaleLink as Link } from '@/components/LocaleLink';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

import { LanguageSelector } from './LanguageSelector';

const PublicHeaderActions = lazy(() =>
  import('@/components/header/PublicHeaderActions').then((module) => ({
    default: module.PublicHeaderActions,
  }))
);

const PublicMobileAccountSection = lazy(() =>
  import('@/components/header/PublicMobileAccountSection').then((module) => ({
    default: module.PublicMobileAccountSection,
  }))
);

function HeaderActionsFallback({ favoritesLabel, signInLabel }: { favoritesLabel: string; signInLabel: string }) {
  return (
    <>
      <Link href="/favoritos" className="hidden md:block relative">
        <Button
          variant="ghost"
          size="icon"
          aria-label={favoritesLabel}
          title={favoritesLabel}
        >
          <Heart className="h-5 w-5" aria-hidden="true" />
        </Button>
      </Link>
      <Link href="/auth" className="hidden md:block">
        <Button variant="outline" size="sm">
          {signInLabel}
        </Button>
      </Link>
    </>
  );
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDeferredActions, setShowDeferredActions] = useState(false);
  const { t, language } = useLanguage();
  const pathname = usePathname() ?? '';
  const companyName = 'YR Inmobiliaria';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setShowDeferredActions(true);
    }, 150);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const propertyTypes = [
    { label: t.propertyTypes.houses, value: 'casa', icon: '🏠' },
    { label: t.propertyTypes.apartments, value: 'departamento', icon: '🏢' },
    { label: t.propertyTypes.commercial, value: 'local', icon: '🏪' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-background/80 backdrop-blur-sm'
      )}
    >
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
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
              href="/"
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
                              href={`/propiedades?type=${type.value}`}
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
                        href="/propiedades"
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
              href="/mapa"
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
              href="/agentes"
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
              href="/nosotros"
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
              href="/contacto"
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
            {showDeferredActions ? (
              <Suspense
                fallback={
                  <HeaderActionsFallback
                    favoritesLabel={t.header.viewFavorites}
                    signInLabel={language === 'es' ? 'Iniciar Sesión' : 'Sign In'}
                  />
                }
              >
                <PublicHeaderActions />
              </Suspense>
            ) : (
              <HeaderActionsFallback
                favoritesLabel={t.header.viewFavorites}
                signInLabel={language === 'es' ? 'Iniciar Sesión' : 'Sign In'}
              />
            )}

            <LanguageSelector />
            
            <Link href="/agendar" className="hidden md:block">
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
                      href="/"
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
                          href={`/propiedades?type=${type.value}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 ml-4 text-sm rounded-lg hover:bg-muted transition-colors"
                        >
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </Link>
                      ))}
                      <Link
                        href="/propiedades"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 ml-4 text-sm rounded-lg hover:bg-muted transition-colors font-medium"
                      >
                        {t.propertyTypes.viewAll}
                      </Link>
                    </div>

                    <Link
                      href="/mapa"
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
                      href="/nosotros"
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
                      href="/contacto"
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
                      href="/agentes"
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
                  <Suspense
                    fallback={
                      <div className="space-y-2">
                        <Link href="/favoritos" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full">
                            {language === 'es' ? 'Mis Favoritos' : 'My Favorites'}
                          </Button>
                        </Link>
                        <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full">
                            {language === 'es' ? 'Iniciar Sesión' : 'Sign In'}
                          </Button>
                        </Link>
                      </div>
                    }
                  >
                    {isMobileMenuOpen ? (
                      <PublicMobileAccountSection onNavigate={() => setIsMobileMenuOpen(false)} />
                    ) : null}
                  </Suspense>

                  <Separator />

                  {/* Schedule Visit CTA */}
                  <Link href="/agendar" onClick={() => setIsMobileMenuOpen(false)}>
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
