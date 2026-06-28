import type { MetadataRoute } from 'next';

import { env } from '@/lib/env';
import { listPublicAgentSlugs, listPublicPropertyIds } from '@/lib/seo-server';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

// Re-genera el sitemap cada hora (ISR).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths: Array<{ path: string; priority: number; changeFrequency: 'weekly' | 'monthly' }> = [
    { path: '', priority: 1, changeFrequency: 'weekly' },
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

  const entries: MetadataRoute.Sitemap = staticPaths.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  }));

  // Mismas fuentes que `generateStaticParams` de las rutas dinámicas (helpers
  // en seo-server, que degradan a `[]` si la BD no responde → el sitemap queda
  // con las rutas estáticas). Garantiza que los slugs del sitemap == los de las
  // páginas (mismo `toSlug`).
  const [propertyIds, agentSlugs] = await Promise.all([
    listPublicPropertyIds(),
    listPublicAgentSlugs(),
  ]);

  for (const id of propertyIds) {
    entries.push({ url: `${SITE_URL}/propiedad/${id}`, changeFrequency: 'weekly', priority: 0.8 });
  }
  for (const slug of agentSlugs) {
    entries.push({ url: `${SITE_URL}/agentes/${slug}`, changeFrequency: 'monthly', priority: 0.6 });
  }

  return entries;
}
