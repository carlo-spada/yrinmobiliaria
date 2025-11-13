import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '@/utils/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { Button } from '@/components/ui/button';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

  const navItems = [
    { label: t.nav.home, href: '#' },
    { label: t.nav.properties, href: '#propiedades' },
    { label: t.nav.about, href: '#nosotros' },
    { label: t.nav.contact, href: '#contacto' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-xl lg:text-2xl font-bold text-primary-foreground">YR</span>
            </div>
            <span className="hidden sm:block text-lg lg:text-xl font-semibold text-foreground">
              Inmobiliaria
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-3 lg:px-4 py-2 text-sm lg:text-base text-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"
              >
                {item.label}
              </a>
            ))}
            <LanguageSelector />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSelector />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-in slide-in-from-top">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-3 text-base text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
