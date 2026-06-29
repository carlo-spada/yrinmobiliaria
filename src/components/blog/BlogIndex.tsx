'use client';

import Link from 'next/link';

import { PageLayout } from '@/components/layout';
import type { CmsPageSummary } from '@/lib/cms';
import { withLocale } from '@/lib/i18n';
import type { Language } from '@/types';

import { formatPostDate } from './blogContent';

const COPY: Record<Language, { heading: string; subtitle: string; empty: string }> = {
  es: {
    heading: 'Blog',
    subtitle: 'Guías, noticias y consejos sobre bienes raíces en Oaxaca.',
    empty: 'Aún no hay publicaciones. Vuelve pronto.',
  },
  en: {
    heading: 'Blog',
    subtitle: 'Real estate guides, news and tips about Oaxaca.',
    empty: 'No posts yet. Check back soon.',
  },
};

// Índice del blog (Server Component): contenido rastreable, idioma desde la ruta.
export function BlogIndex({ locale, posts }: { locale: Language; posts: CmsPageSummary[] }) {
  const t = COPY[locale];
  return (
    <PageLayout>
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-playfair text-4xl font-bold">{t.heading}</h1>
        <p className="mt-2 text-muted-foreground">{t.subtitle}</p>

        {posts.length === 0 ? (
          <p className="mt-10 text-muted-foreground">{t.empty}</p>
        ) : (
          <ul className="mt-10 space-y-6">
            {posts.map((post) => (
              <li key={post.slug} className="border-b pb-6 last:border-b-0">
                <Link href={withLocale(`/blog/${post.slug}`, locale)} className="group block">
                  <h2 className="text-2xl font-semibold transition-colors group-hover:text-primary">
                    {post.title}
                  </h2>
                  <time className="text-sm text-muted-foreground" dateTime={post.updated_at}>
                    {formatPostDate(post.updated_at, locale)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageLayout>
  );
}
