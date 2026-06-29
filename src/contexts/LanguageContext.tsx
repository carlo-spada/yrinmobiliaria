'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';

import { isPublicPath, localeFromPathname, stripLocale, withLocale } from '@/lib/i18n';
import { Language, Translation } from '@/types';
import { translations } from '@/utils/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translation;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCALE_COOKIE = 'locale';
const ONE_YEAR = 60 * 60 * 24 * 365;

/** Lee la preferencia persistida en la cookie `locale` (solo en cliente). */
function readLocaleCookie(): Language | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)locale=(es|en)\b/);
  return (match?.[1] as Language) ?? null;
}

export function LanguageProvider({
  children,
  initialLanguage = 'es',
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  const pathname = usePathname() ?? '/';
  const router = useRouter();

  // i18n por URL: en el sitio PÚBLICO la URL manda (`/en/...` → inglés; raíz →
  // español). En rutas PRIVADAS (sin espejo /en) seguimos la preferencia en
  // cookie. La derivación por URL es determinista, así que no hay desajuste de
  // hidratación (el cuerpo público es `ssr:false`).
  const onPublic = isPublicPath(stripLocale(pathname));
  // El cookieLang solo gobierna rutas PRIVADAS (sin espejo /en). Se inicializa de
  // forma perezosa desde la cookie: en servidor `readLocaleCookie()` es null →
  // `initialLanguage`. En público el idioma se deriva de la URL (determinista),
  // así que esta diferencia servidor/cliente no afecta el render (sin mismatch).
  const [cookieLang, setCookieLang] = useState<Language>(
    () => readLocaleCookie() ?? initialLanguage,
  );

  const language: Language = onPublic ? localeFromPathname(pathname) : cookieLang;

  // Persiste la preferencia. En público navega al árbol del otro idioma (la URL
  // es la fuente de verdad); en privado solo cambia el estado (no hay /en).
  const setLanguage = useCallback(
    (lang: Language) => {
      if (typeof document !== 'undefined') {
        document.cookie = `${LOCALE_COOKIE}=${lang}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
      }
      setCookieLang(lang);
      if (isPublicPath(stripLocale(pathname))) {
        const search = typeof window !== 'undefined' ? window.location.search : '';
        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        router.push(`${withLocale(stripLocale(pathname), lang)}${search}${hash}`);
      }
    },
    [pathname, router],
  );

  // Mantiene `<html lang>` sincronizado con el idioma activo (a11y/correctitud).
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: translations[language],
    }),
    [language, setLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
