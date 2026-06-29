import { cache } from 'react';

import { getPublicSupabase } from '@/lib/supabase/server';

/**
 * Lectura pública del CMS (`cms_pages`). La RLS permite a anon leer solo las filas
 * `is_published = true`. El contenido se renderiza en SERVIDOR (a diferencia de
 * las pantallas `ssr:false`) porque un blog vive de que su texto sea rastreable.
 */

export interface CmsPageSummary {
  slug: string;
  title: string;
  updated_at: string;
}

export interface CmsPage extends CmsPageSummary {
  content: string;
  created_at: string;
}

/**
 * Extrae texto plano del `content` (jsonb de forma no garantizada): string
 * directo, objeto `{markdown|html|body|content|text}`, o arreglo de bloques. Si no
 * encuentra texto, devuelve ''. Pura y testeable.
 */
export function extractCmsText(content: unknown): string {
  if (content == null) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map(extractCmsText).filter(Boolean).join('\n\n');
  }
  if (typeof content === 'object') {
    const obj = content as Record<string, unknown>;
    for (const key of ['markdown', 'html', 'body', 'text', 'content']) {
      const value = obj[key];
      if (typeof value === 'string') return value;
      if (Array.isArray(value) || (value && typeof value === 'object')) {
        const nested = extractCmsText(value);
        if (nested) return nested;
      }
    }
    if (Array.isArray(obj.blocks)) return extractCmsText(obj.blocks);
  }
  return '';
}

/** Resúmenes de páginas CMS publicadas (para el índice del blog + sitemap). */
export const listPublishedCmsPages = cache(async (): Promise<CmsPageSummary[]> => {
  try {
    const supabase = getPublicSupabase();
    const { data } = await supabase
      .from('cms_pages')
      .select('slug,title,updated_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false });
    return (data ?? []) as CmsPageSummary[];
  } catch {
    return [];
  }
});

/** Una página CMS publicada por slug (o null si no existe / no publicada). */
export const getPublishedCmsPage = cache(async (slug: string): Promise<CmsPage | null> => {
  try {
    const supabase = getPublicSupabase();
    const { data } = await supabase
      .from('cms_pages')
      .select('slug,title,content,created_at,updated_at')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();
    if (!data) return null;
    return {
      slug: data.slug,
      title: data.title,
      content: extractCmsText(data.content),
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch {
    return null;
  }
});
