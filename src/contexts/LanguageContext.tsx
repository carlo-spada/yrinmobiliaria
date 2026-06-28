'use client';

import { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';

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

export function LanguageProvider({
  children,
  initialLanguage = 'es',
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  // Persistimos el idioma en cookie para que el servidor pueda emitir el
  // <html lang> correcto en la siguiente navegación/SSR.
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
