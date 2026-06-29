import type { Metadata } from 'next';

import { hreflangFor } from '@/lib/seo-server';
import type { Language } from '@/types';

/**
 * Copia SEO bilingüe de las páginas públicas estáticas, en UNA sola fuente. Tanto
 * la ruta ES (raíz) como su espejo `/en` derivan su `<title>`/`description` de
 * aquí, así no divergen. `staticPageMetadata(path, locale)` arma la `Metadata`
 * (incluye canonical + hreflang recíproco vía `hreflangFor`).
 */
interface Copy {
  title: string;
  description: string;
}

interface PageSeo {
  es: Copy;
  en: Copy;
  /** Emitir `openGraph` (default true). */
  og?: boolean;
  /** `robots: index:false` (default false). */
  noindex?: boolean;
}

export const STATIC_PAGE_SEO: Record<string, PageSeo> = {
  '/propiedades': {
    es: {
      title: 'Propiedades en venta y renta en Oaxaca',
      description:
        'Explora casas, departamentos, terrenos y locales en Oaxaca. Filtra por zona, precio y tipo de operación.',
    },
    en: {
      title: 'Properties for sale and rent in Oaxaca',
      description:
        'Browse houses, apartments, land and commercial spaces in Oaxaca. Filter by zone, price and operation type.',
    },
  },
  '/agentes': {
    es: {
      title: 'Nuestros agentes',
      description: 'Conoce al equipo de asesores inmobiliarios de YR Inmobiliaria en Oaxaca.',
    },
    en: {
      title: 'Our agents',
      description: 'Meet the team of real estate advisors at YR Inmobiliaria in Oaxaca.',
    },
  },
  '/mapa': {
    es: {
      title: 'Mapa de propiedades en Oaxaca',
      description: 'Encuentra propiedades por ubicación en el mapa interactivo de Oaxaca.',
    },
    en: {
      title: 'Property map in Oaxaca',
      description: 'Find properties by location on the interactive map of Oaxaca.',
    },
  },
  '/nosotros': {
    es: {
      title: 'Nosotros',
      description:
        'Conoce a YR Inmobiliaria: más de 10 años de experiencia en bienes raíces en Oaxaca.',
    },
    en: {
      title: 'About us',
      description: 'Meet YR Inmobiliaria: over 10 years of real estate experience in Oaxaca.',
    },
  },
  '/contacto': {
    es: {
      title: 'Contacto',
      description:
        'Ponte en contacto con YR Inmobiliaria. Estamos para ayudarte a encontrar tu próxima propiedad en Oaxaca.',
    },
    en: {
      title: 'Contact',
      description:
        'Get in touch with YR Inmobiliaria. We are here to help you find your next property in Oaxaca.',
    },
  },
  '/agendar': {
    es: {
      title: 'Agenda una visita',
      description:
        'Agenda una visita a la propiedad que te interesa con un asesor de YR Inmobiliaria.',
    },
    en: {
      title: 'Schedule a visit',
      description:
        'Schedule a visit to the property you are interested in with a YR Inmobiliaria advisor.',
    },
  },
  '/privacidad': {
    es: { title: 'Aviso de privacidad', description: 'Aviso de privacidad de YR Inmobiliaria.' },
    en: { title: 'Privacy policy', description: 'Privacy policy of YR Inmobiliaria.' },
    og: false,
  },
  '/terminos': {
    es: {
      title: 'Términos y condiciones',
      description: 'Términos y condiciones de uso de YR Inmobiliaria.',
    },
    en: { title: 'Terms of service', description: 'Terms and conditions of use of YR Inmobiliaria.' },
    og: false,
  },
  '/derechos-arco': {
    es: {
      title: 'Derechos ARCO',
      description:
        'Ejerce tus derechos de Acceso, Rectificación, Cancelación u Oposición sobre tus datos personales.',
    },
    en: {
      title: 'Data rights (ARCO)',
      description:
        'Exercise your rights of Access, Rectification, Cancellation, or Opposition over your personal data.',
    },
    og: false,
  },
  '/favoritos': {
    es: {
      title: 'Tus propiedades favoritas',
      description: 'Las propiedades que guardaste en YR Inmobiliaria.',
    },
    en: {
      title: 'Your favorite properties',
      description: 'The properties you saved at YR Inmobiliaria.',
    },
    og: false,
    noindex: true,
  },
};

/** Lista de rutas canónicas ES con copia estática (para el sitemap). */
export const STATIC_PAGE_PATHS = Object.keys(STATIC_PAGE_SEO);

/** `Metadata` de una página estática pública en un locale (title/desc/canonical/hreflang/og). */
export function staticPageMetadata(path: string, locale: Language): Metadata {
  const entry = STATIC_PAGE_SEO[path];
  const alternates = hreflangFor(path, locale);
  if (!entry) return { alternates };
  const copy = entry[locale];
  const metadata: Metadata = {
    title: copy.title,
    description: copy.description,
    alternates,
  };
  if (entry.og !== false) {
    metadata.openGraph = { title: copy.title, description: copy.description };
  }
  if (entry.noindex) {
    metadata.robots = { index: false, follow: false };
  }
  return metadata;
}
