import { cookies } from 'next/headers';

import { getPublicSupabase } from '@/lib/supabase/server';
import type { Language } from '@/types';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yrinmobiliaria.com';

/** Idioma activo leído de la cookie `locale` (default 'es'). */
export async function getServerLocale(): Promise<Language> {
  const cookieStore = await cookies();
  return (cookieStore.get('locale')?.value as Language) || 'es';
}

/**
 * `alternates` (canonical + hreflang). Como el contenido vive en columnas
 * *_es/*_en bajo una sola URL por página (decisión i18n del plan), ambos
 * idiomas apuntan a la misma ruta canónica.
 */
export function hreflangFor(path: string) {
  const url = `${SITE_URL}${path === '/' ? '' : path}`;
  const canonical = url || SITE_URL;
  return {
    canonical,
    languages: {
      es: canonical,
      en: canonical,
      'x-default': canonical,
    },
  };
}

export interface PropertyMeta {
  title: { es: string; en: string };
  description: { es: string; en: string };
  price: number;
  zone: string;
  neighborhood: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  status: string;
  images: string[];
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function fetchPropertyMeta(id: string): Promise<PropertyMeta | null> {
  if (!UUID_RE.test(id)) return null;

  const supabase = getPublicSupabase();
  const { data } = await supabase
    .from('properties')
    .select(
      'title_es,title_en,description_es,description_en,price,status,location,property_images(image_url,display_order)'
    )
    .eq('id', id)
    .single();

  if (!data) return null;

  const location = (data.location ?? {}) as Record<string, unknown>;
  const coords = location.coordinates as { lat?: unknown; lng?: unknown } | undefined;
  const images = (data.property_images ?? [])
    .slice()
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((img) => img.image_url);

  return {
    title: { es: data.title_es ?? '', en: data.title_en ?? '' },
    description: { es: data.description_es ?? '', en: data.description_en ?? '' },
    price: Number(data.price) || 0,
    zone: (location.zone as string) || '',
    neighborhood: (location.neighborhood as string) || '',
    address: (location.address as string) || '',
    coordinates: coords ? { lat: Number(coords.lat) || 0, lng: Number(coords.lng) || 0 } : undefined,
    status: data.status ?? 'disponible',
    images,
  };
}

export interface AgentMeta {
  id: string;
  display_name: string;
  bio: { es: string; en: string };
  photo_url: string | null;
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/ /g, '-');
}

export async function fetchAgentMeta(slug: string): Promise<AgentMeta | null> {
  const supabase = getPublicSupabase();
  const { data } = await supabase.rpc('get_public_agents');
  const agents = (data ?? []) as Array<{
    id: string;
    display_name: string;
    bio_es: string | null;
    bio_en: string | null;
    photo_url: string | null;
  }>;
  const match = agents.find((a) => toSlug(a.display_name) === slug.toLowerCase());
  if (!match) return null;
  return {
    id: match.id,
    display_name: match.display_name,
    bio: { es: match.bio_es ?? '', en: match.bio_en ?? '' },
    photo_url: match.photo_url,
  };
}

export function formatMXN(price: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(price);
}

// ---------------------------------------------------------------------------
// JSON-LD builders (versión servidor: usan SITE_URL en lugar de window.location)
// ---------------------------------------------------------------------------

export function buildOrganizationLd(language: Language): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'YR Inmobiliaria',
    description:
      language === 'es'
        ? 'Expertos en bienes raíces en Oaxaca, México. Encuentra tu hogar perfecto con más de 10 años de experiencia.'
        : 'Real estate experts in Oaxaca, Mexico. Find your perfect home with over 10 years of experience.',
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+52-951-123-4567',
      contactType: 'customer service',
      availableLanguage: ['Spanish', 'English'],
    },
    sameAs: ['https://facebook.com/yrinmobiliaria', 'https://instagram.com/yrinmobiliaria'],
  };
}

export function buildLocalBusinessLd(language: Language): Record<string, unknown> {
  return {
    ...buildOrganizationLd(language),
    '@type': 'RealEstateAgent',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Centro Histórico',
      addressLocality: 'Oaxaca de Juárez',
      addressRegion: 'Oaxaca',
      addressCountry: 'MX',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 17.0732, longitude: -96.7266 },
    openingHours: 'Mo-Fr 09:00-18:00',
    priceRange: '$$',
  };
}

export function buildProductLd(property: PropertyMeta, language: Language): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: property.title[language],
    description: (property.description[language] || '').substring(0, 200),
    image: property.images[0] || '',
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'MXN',
      availability:
        property.status === 'disponible'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/UsedCondition',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.neighborhood,
      addressRegion: property.zone,
      addressCountry: 'MX',
    },
    ...(property.coordinates
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: property.coordinates.lat,
            longitude: property.coordinates.lng,
          },
        }
      : {}),
  };
}

export function buildBreadcrumbLd(items: Array<{ name: string; url: string }>): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildPersonLd(agent: AgentMeta, language: Language): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: agent.display_name,
    description: (agent.bio[language] || '').substring(0, 200),
    ...(agent.photo_url ? { image: agent.photo_url } : {}),
    jobTitle: language === 'es' ? 'Asesor inmobiliario' : 'Real Estate Agent',
    worksFor: { '@type': 'Organization', name: 'YR Inmobiliaria', url: SITE_URL },
    url: `${SITE_URL}/agentes/${agent.display_name.toLowerCase().replace(/ /g, '-')}`,
  };
}
