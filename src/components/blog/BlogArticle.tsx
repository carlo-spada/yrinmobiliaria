'use client';

import Link from 'next/link';

import { PageLayout } from '@/components/layout';
import type { CmsPage } from '@/lib/cms';
import { withLocale } from '@/lib/i18n';
import type { Language } from '@/types';

import { formatPostDate, splitParagraphs } from './blogContent';

const COPY: Record<Language, { back: string; published: string }> = {
  es: { back: '← Volver al blog', published: 'Publicado el' },
  en: { back: '← Back to blog', published: 'Published on' },
};

// Artículo del blog (Server Component): texto rastreable. Render mínimo y seguro
// (párrafos; React escapa el texto → sin XSS). El markdown enriquecido queda como
// follow-up cuando exista contenido + un editor que lo escriba.
export function BlogArticle({ locale, page }: { locale: Language; page: CmsPage }) {
  const t = COPY[locale];
  const paragraphs = splitParagraphs(page.content);
  return (
    <PageLayout>
      <article className="container mx-auto max-w-3xl px-4 py-12">
        <Link href={withLocale('/blog', locale)} className="text-sm text-primary">
          {t.back}
        </Link>
        <h1 className="mt-4 font-playfair text-4xl font-bold">{page.title}</h1>
        <time className="mt-2 block text-sm text-muted-foreground" dateTime={page.updated_at}>
          {t.published} {formatPostDate(page.updated_at, locale)}
        </time>
        <div className="mt-8 space-y-4 leading-relaxed">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="whitespace-pre-wrap">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </PageLayout>
  );
}
