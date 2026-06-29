import { cache } from 'react';

import { env } from '@/lib/env';
import { getPublicSupabase } from '@/lib/supabase/server';
import type { Language } from '@/types';
import { slugify } from '@/utils/slug';

export const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

/**
 * Locale canónico por defecto. Con i18n de URL única (sin prefijo /en todavía),
 * el render de servidor (`<html lang>`, metadata, JSON-LD) usa este valor; el
 * cambio a 'en' es 100% del cliente (`LanguageProvider`). La i18n por URL —y un
 * locale derivado del segmento de ruta— llega en Phase 5.1.
 */
export const DEFAULT_LOCALE: Language = 'es';

/**
 * Locale con el que el servidor renderiza la ruta. Hoy siempre el canónico 'es':
 * **no** lee la cookie `locale`, así que no marca la página como dinámica y
 * permite render estático/ISR (Phase 4.1). Se mantiene como `Promise` para que
 * 5.1 pueda derivarlo del segmento de URL sin tocar los 13 `page.tsx` que ya
 * hacen `await getServerLocale()`.
 */
export function getServerLocale(): Promise<Language> {
  return Promise.resolve(DEFAULT_LOCALE);
}

// ---------------------------------------------------------------------------
// site_settings (NAP/redes reales) para el JSON-LD del servidor
// ---------------------------------------------------------------------------

/** Mapa `setting_key` → valor (string) de `public.site_settings`. */
export type SiteSettingsMap = Record<string, string>;

/**
 * Lee `site_settings` (lectura pública por RLS, cliente anon) para alimentar el
 * JSON-LD con la NAP/redes reales que el admin configura en el panel, en vez de
 * placeholders quemados en código. `cache()` deduplica la consulta por request;
 * degrada a `{}` si la BD no responde (el JSON-LD cae a constantes seguras y
 * omite los campos sin dato — nunca emite datos falsos).
 */
export const getPublicSiteSettings = cache(async (): Promise<SiteSettingsMap> => {
  try {
    const supabase = getPublicSupabase();
    const { data } = await supabase.from('site_settings').select('setting_key, setting_value');
    const map: SiteSettingsMap = {};
    for (const row of (data ?? []) as Array<{ setting_key: string; setting_value: unknown }>) {
      const value = row.setting_value;
      if (value == null) continue;
      const str = (typeof value === 'string' ? value : String(value)).trim();
      if (str) map[row.setting_key] = str;
    }
    return map;
  } catch {
    return {};
  }
});

/** `true` si es una URL http(s) absoluta (filtro para `sameAs`). */
function isHttpUrl(value: string | undefined): value is string {
  return typeof value === 'string' && /^https?:\/\/\S+$/i.test(value.trim());
}

/**
 * Normaliza un teléfono a E.164 (`+<dígitos>`) para `telephone`. Prefiere el
 * `whatsapp_number` (la app lo valida como `52` + 10 dígitos, ya con código de
 * país) sobre el `company_phone` de display. Devuelve `null` si no hay dígitos.
 */
export function toE164(...candidates: Array<string | undefined>): string | null {
  for (const raw of candidates) {
    const digits = (raw ?? '').replace(/\D/g, '');
    if (digits) return `+${digits}`;
  }
  return null;
}

export interface PostalAddressParts {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  addressCountry: string;
}

function normalizeCountry(value: string): string {
  const s = value.trim().toLowerCase();
  if (s === 'méxico' || s === 'mexico' || s === 'mx') return 'MX';
  return value.trim();
}

/**
 * Parte la dirección de `company_address` en campos de `PostalAddress`. Formato
 * esperado (panel de admin): «calle, colonia, ciudad, estado, país». Si no trae
 * las 5 partes, cae a poner todo en `streetAddress` con la ubicación constante
 * del negocio (Oaxaca) — nunca inventa datos. Devuelve `null` si viene vacío.
 */
export function parseAddress(raw: string | undefined | null): PostalAddressParts | null {
  if (!raw?.trim()) return null;
  const parts = raw
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 5) {
    return {
      streetAddress: `${parts[0]}, ${parts[1]}`,
      addressLocality: parts[2],
      addressRegion: parts[3],
      addressCountry: normalizeCountry(parts[parts.length - 1]),
    };
  }
  return {
    streetAddress: raw.trim(),
    addressLocality: 'Oaxaca de Juárez',
    addressRegion: 'Oaxaca',
    addressCountry: 'MX',
  };
}

/**
 * IDs de propiedades públicas (status `disponible`) para `generateStaticParams`
 * y el sitemap. Degrada a `[]` si la BD no responde (build no se rompe; las
 * rutas se generan on-demand vía `dynamicParams`).
 */
export async function listPublicPropertyIds(): Promise<string[]> {
  try {
    const supabase = getPublicSupabase();
    const { data } = await supabase.from('properties').select('id').eq('status', 'disponible');
    return (data ?? []).map((p) => p.id);
  } catch {
    return [];
  }
}

/** Slugs de agentes públicos (directorio) para `generateStaticParams` y el sitemap. */
export async function listPublicAgentSlugs(): Promise<string[]> {
  try {
    const supabase = getPublicSupabase();
    const { data } = await supabase.rpc('get_public_agents');
    return ((data ?? []) as Array<{ display_name: string }>).map((a) => toSlug(a.display_name));
  } catch {
    return [];
  }
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

// `cache()` deduplica la consulta dentro de un mismo request: `generateMetadata`
// y el cuerpo de la página comparten una sola lectura a Supabase por render.
export const fetchPropertyMeta = cache(async (id: string): Promise<PropertyMeta | null> => {
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
});

export interface AgentMeta {
  id: string;
  display_name: string;
  bio: { es: string; en: string };
  photo_url: string | null;
}

// Mismo algoritmo de slug que los enlaces del cliente (`generateSlug`), vía la
// fuente de verdad compartida — así `generateStaticParams`, la metadata canónica
// y el JSON-LD producen exactamente la misma URL que apunta cada `<Link>`.
function toSlug(name: string) {
  return slugify(name);
}

export const fetchAgentMeta = cache(async (slug: string): Promise<AgentMeta | null> => {
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
});

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

export function buildOrganizationLd(
  language: Language,
  settings: SiteSettingsMap = {},
): Record<string, unknown> {
  const telephone = toE164(settings.whatsapp_number, settings.company_phone);
  const email = settings.company_email;
  const sameAs = [settings.facebook_url, settings.instagram_url].filter(isHttpUrl);
  const hasContact = Boolean(telephone || email);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.company_name || 'YR Inmobiliaria',
    description:
      language === 'es'
        ? 'Expertos en bienes raíces en Oaxaca, México. Encuentra tu hogar perfecto con más de 10 años de experiencia.'
        : 'Real estate experts in Oaxaca, Mexico. Find your perfect home with over 10 years of experience.',
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    // Solo incluimos contactPoint/sameAs cuando hay dato real (site_settings);
    // así un fallo de BD nunca emite teléfonos/redes falsos en el JSON-LD.
    ...(hasContact
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            ...(telephone ? { telephone } : {}),
            ...(email ? { email } : {}),
            contactType: 'customer service',
            areaServed: 'MX',
            availableLanguage: ['Spanish', 'English'],
          },
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function buildLocalBusinessLd(
  language: Language,
  settings: SiteSettingsMap = {},
): Record<string, unknown> {
  const telephone = toE164(settings.whatsapp_number, settings.company_phone);
  const email = settings.company_email;
  const address = parseAddress(settings.company_address);
  return {
    ...buildOrganizationLd(language, settings),
    '@type': 'RealEstateAgent',
    ...(telephone ? { telephone } : {}),
    ...(email ? { email } : {}),
    ...(address ? { address: { '@type': 'PostalAddress', ...address } } : {}),
    geo: { '@type': 'GeoCoordinates', latitude: 17.0732, longitude: -96.7266 },
    // Horario real (site_settings.business_hours): L-V 9-18, S-D 10-16. En formato
    // schema.org (el texto libre en español no es parseable de forma fiable).
    openingHours: ['Mo-Fr 09:00-18:00', 'Sa-Su 10:00-16:00'],
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
    // Mismo `toSlug` que generateStaticParams / sitemap / fetchAgentMeta: una
    // sola fuente para el slug (evita que el `url` del JSON-LD diverja).
    url: `${SITE_URL}/agentes/${toSlug(agent.display_name)}`,
  };
}
