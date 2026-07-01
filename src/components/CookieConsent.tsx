'use client';

import { LocaleLink } from '@/components/LocaleLink';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCookieConsent } from '@/hooks/useCookieConsent';

/**
 * Banner de consentimiento de cookies de análisis (bilingüe vía LanguageContext).
 * Solo aparece si hay GA configurada y el usuario no ha decidido (ver
 * `useCookieConsent`). Aceptar/Rechazar actualiza el Consent Mode v2 de GA.
 */
export function CookieConsent() {
  const { t } = useLanguage();
  const { showBanner, accept, reject } = useCookieConsent();

  if (!showBanner) return null;

  const c = t.legal.cookies;
  return (
    <div
      role="region"
      aria-label="Cookies"
      className="fixed inset-x-0 bottom-0 z-[60] border-t bg-background/95 p-4 shadow-lg backdrop-blur"
    >
      <div className="container mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {c.message}{' '}
          <LocaleLink href="/privacidad" className="underline underline-offset-2 hover:text-primary">
            {c.learnMore}
          </LocaleLink>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={reject}>
            {c.reject}
          </Button>
          <Button size="sm" onClick={accept}>
            {c.accept}
          </Button>
        </div>
      </div>
    </div>
  );
}
