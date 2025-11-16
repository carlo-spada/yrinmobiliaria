import { MapPin, Phone, Mail, Facebook, Instagram, Linkedin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-accent-foreground">YR</span>
              </div>
              <span className="text-xl font-semibold">Inmobiliaria</span>
            </div>
            <p className="text-sm text-secondary-foreground/80 leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">{t('footer.contact')}</h3>
            <div className="space-y-3">
              <a
                href="#"
                className="flex items-start gap-3 text-sm text-secondary-foreground/80 hover:text-accent transition-colors group"
              >
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 group-hover:text-accent" />
                <span>{t('footer.address')}</span>
              </a>
              <a
                href={`tel:${t('footer.phone')}`}
                className="flex items-center gap-3 text-sm text-secondary-foreground/80 hover:text-accent transition-colors group"
              >
                <Phone className="h-5 w-5 flex-shrink-0 group-hover:text-accent" />
                <span>{t('footer.phone')}</span>
              </a>
              <a
                href={`mailto:${t('footer.email')}`}
                className="flex items-center gap-3 text-sm text-secondary-foreground/80 hover:text-accent transition-colors group"
              >
                <Mail className="h-5 w-5 flex-shrink-0 group-hover:text-accent" />
                <span>{t('footer.email')}</span>
              </a>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">{t('footer.followUs')}</h3>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-secondary-foreground/10 text-center text-sm text-secondary-foreground/60">
          <p>
            © {currentYear} YR Inmobiliaria. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
