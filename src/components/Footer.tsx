import { MapPin, Phone, Mail, Facebook, Instagram, Linkedin } from 'lucide-react';
import { useLanguage } from '@/utils/LanguageContext';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function Footer() {
  const { t, language } = useLanguage();
  const { getSetting, isLoading } = useSiteSettings();
  const currentYear = new Date().getFullYear();

  // Get dynamic settings with fallbacks
  const companyPhone = getSetting('company_phone', '(951) 123-4567');
  const companyEmail = getSetting('company_email', 'contacto@yrinmobiliaria.com');
  const companyAddress = getSetting('company_address', 'Calle Independencia 123, Centro Histórico, Oaxaca de Juárez, Oaxaca, México');
  const facebookUrl = getSetting('facebook_url', 'https://facebook.com');
  const instagramUrl = getSetting('instagram_url', 'https://instagram.com');

  const quickLinks = [
    { label: t.nav?.properties || 'Propiedades', href: '/propiedades' },
    { label: t.nav?.map || 'Mapa', href: '/mapa' },
    { label: t.nav?.about || 'Nosotros', href: '/nosotros' },
    { label: t.nav?.contact || 'Contacto', href: '/contacto' },
  ];

  // Fetch zones from database with consistent cache key
  const { data: zonesData = [] } = useQuery({
    queryKey: ['service-zones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_zones')
        .select('name_es, name_en')
        .eq('active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Transform zones data for footer
  const zones = zonesData.map((zone) => {
    const zoneName = language === 'es' ? zone.name_es : zone.name_en;
    return {
      label: zoneName,
      href: `/propiedades?zone=${encodeURIComponent(zone.name_es)}`,
    };
  });

  const socialLinks = [
    { icon: Facebook, label: 'Facebook', url: facebookUrl },
    { icon: Instagram, label: 'Instagram', url: instagramUrl },
    { icon: Linkedin, label: 'LinkedIn', url: 'https://linkedin.com' },
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-accent-foreground">YR</span>
              </div>
              <span className="text-xl font-semibold">Inmobiliaria</span>
            </div>
            <p className="text-sm text-secondary-foreground/80 leading-relaxed">
              {t.footer.description}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.footer.quickLinks}</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-secondary-foreground/80 hover:text-accent transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Zones */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.footer.zones}</h3>
            <ul className="space-y-3">
              {zones.map((zone) => (
                <li key={zone.href}>
                  <Link
                    to={zone.href}
                    className="text-sm text-secondary-foreground/80 hover:text-accent transition-colors inline-block"
                  >
                    {zone.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Social */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.footer.contact}</h3>
            <div className="space-y-3">
              {isLoading ? (
                <>
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-12 w-full" />
                </>
              ) : (
                <>
                  <a
                    href={`tel:${companyPhone.replace(/\s+/g, '')}`}
                    className="flex items-center gap-3 text-sm text-secondary-foreground/80 hover:text-accent transition-colors group"
                  >
                    <Phone className="h-5 w-5 flex-shrink-0 group-hover:text-accent" />
                    <span>{companyPhone}</span>
                  </a>
                  <a
                    href={`mailto:${companyEmail}`}
                    className="flex items-center gap-3 text-sm text-secondary-foreground/80 hover:text-accent transition-colors group"
                  >
                    <Mail className="h-5 w-5 flex-shrink-0 group-hover:text-accent" />
                    <span>{companyEmail}</span>
                  </a>
                  <div className="flex items-start gap-3 text-sm text-secondary-foreground/80">
                    <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed whitespace-pre-line">
                      {companyAddress}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Social Media */}
            <div className="pt-4">
              <h4 className="text-sm font-semibold mb-3">{t.footer.followUs}</h4>
              <div className="flex gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                      aria-label={social.label}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-secondary-foreground/10" />

        {/* Copyright & Legal */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-secondary-foreground/60">
          <p>
            © {currentYear} YR Inmobiliaria. {t.footer.rights}
          </p>
          <div className="flex gap-6">
            <Link to="/privacidad" className="hover:text-accent transition-colors">
              {t.footer.privacy}
            </Link>
            <Link to="/terminos" className="hover:text-accent transition-colors">
              {t.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
