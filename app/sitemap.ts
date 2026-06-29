import type { MetadataRoute } from 'next';

import { env } from '@/lib/env';
import { withLocale } from '@/lib/i18n';
import { listPublicAgentSlugs, listPublicPropertyIds } from '@/lib/seo-server';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

// Re-genera el sitemap cada hora (ISR).
export const revalidate = 3600;

type ChangeFreq = 'weekly' | 'monthly';

/** URL absoluta de una ruta canónica ES en un locale ('/'→raíz; 'en'→/en). */
function abs(path: string, locale: 'es' | 'en'): string {
  const rel = withLocale(path, locale);
  return rel === '/' ? SITE_URL : `${SITE_URL}${rel}`;
}

/**
 * Emite las DOS versiones (es + en) de una ruta, cada una con `alternates`
 * recíprocos (hreflang en el sitemap) — así Google indexa ambos idiomas y sabe
 * que son equivalentes.
 */
function localizedEntries(
  path: string,
  changeFrequency: ChangeFreq,
  priority: number,
): MetadataRoute.Sitemap {
  const es = abs(path, 'es');
  const en = abs(path, 'en');
  const languages = { es, en };
  return [
    { url: es, changeFrequency, priority, alternates: { languages } },
    { url: en, changeFrequency, priority, alternates: { languages } },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths: Array<{ path: string; priority: number; changeFrequency: ChangeFreq }> = [
    { path: '/', priority: 1, changeFrequency: 'weekly' },
    { path: '/propiedades', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/mapa', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/agentes', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/nosotros', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/contacto', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/agendar', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/privacidad', priority: 0.3, changeFrequency: 'monthly' },
    { path: '/terminos', priority: 0.3, changeFrequency: 'monthly' },
    { path: '/derechos-arco', priority: 0.3, changeFrequency: 'monthly' },
  ];

  const entries: MetadataRoute.Sitemap = staticPaths.flatMap(({ path, priority, changeFrequency }) =>
    localizedEntries(path, changeFrequency, priority),
  );

  // Mismas fuentes que `generateStaticParams` de las rutas dinámicas (helpers en
  // seo-server, que degradan a `[]` si la BD no responde). Garantiza que los slugs
  // del sitemap == los de las páginas (mismo `toSlug`), en ambos idiomas.
  const [propertyIds, agentSlugs] = await Promise.all([
    listPublicPropertyIds(),
    listPublicAgentSlugs(),
  ]);

  for (const id of propertyIds) {
    entries.push(...localizedEntries(`/propiedad/${id}`, 'weekly', 0.8));
  }
  for (const slug of agentSlugs) {
    entries.push(...localizedEntries(`/agentes/${slug}`, 'monthly', 0.6));
  }

  return entries;
}
