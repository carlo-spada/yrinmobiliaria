'use client';

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';

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
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  // El servidor ahora renderiza siempre el locale canónico ('es') porque ya no
  // lee la cookie (Phase 4.1: leerla marcaría la página como dinámica). Tras
  // montar, adoptamos la preferencia persistida del usuario. Es seguro: los
  // cuerpos públicos son `ssr:false`, así que no hay HTML localizado del
  // servidor con el que des-sincronizarse (sin hydration mismatch).
  useEffect(() => {
    const persisted = readLocaleCookie();
    if (persisted && persisted !== language) {
      setLanguageState(persisted);
    }
    // Solo al montar: adopta la preferencia inicial una vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mantiene `<html lang>` sincronizado con el idioma activo (a11y/correctitud).
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  // Persistimos el idioma en cookie para recuperarlo en la siguiente carga.
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof document !== 'undefined') {
      document.cookie = `${LOCALE_COOKIE}=${lang}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
    }
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: translations[language],
    }),
    [language, setLanguage]
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
