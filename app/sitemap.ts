import type { MetadataRoute } from 'next';

import { getPublicSupabase } from '@/lib/supabase/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yrinmobiliaria.com';

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
  ];

  const entries: MetadataRoute.Sitemap = staticPaths.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  }));

  try {
    const supabase = getPublicSupabase();

    const { data: properties } = await supabase
      .from('properties')
      .select('id')
      .eq('status', 'disponible');
    for (const property of properties ?? []) {
      entries.push({
        url: `${SITE_URL}/propiedad/${property.id}`,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }

    const { data: agents } = await supabase.rpc('get_public_agents');
    for (const agent of (agents ?? []) as Array<{ display_name: string }>) {
      const slug = agent.display_name.toLowerCase().replace(/ /g, '-');
      entries.push({
        url: `${SITE_URL}/agentes/${slug}`,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  } catch {
    // Si la BD no responde, el sitemap degrada a las rutas estáticas.
  }

  return entries;
}
