export type Language = 'es' | 'en';

export interface Translation {
  nav: {
    home: string;
    properties: string;
    about: string;
    contact: string;
  };
  hero: {
    title: string;
    subtitle: string;
    cta: string;
  };
  footer: {
    contact: string;
    address: string;
    phone: string;
    email: string;
    followUs: string;
    rights: string;
  };
}

export interface Translations {
  es: Translation;
  en: Translation;
}
