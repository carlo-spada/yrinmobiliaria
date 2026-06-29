import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { BlogArticle } from '@/components/blog/BlogArticle';
import { excerpt } from '@/components/blog/blogContent';
import { JsonLd } from '@/components/seo/JsonLd';
import { getPublishedCmsPage, listPublishedCmsPages } from '@/lib/cms';
import { buildArticleLd, hreflangFor } from '@/lib/seo-server';

type PageProps = { params: Promise<{ slug: string }> };

// Espejo inglés de /blog/[slug]. Mismos params/ISR; locale fijo 'en'.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await listPublishedCmsPages();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedCmsPage(slug);
  if (!page) {
    return { title: 'Article not found', robots: { index: false, follow: false } };
  }
  const description = excerpt(page.content) || page.title;
  return {
    title: page.title,
    description,
    alternates: hreflangFor(`/blog/${slug}`, 'en'),
    openGraph: { title: page.title, description, type: 'article' },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPublishedCmsPage(slug);
  if (!page) notFound();

  const description = excerpt(page.content) || page.title;
  return (
    <>
      <JsonLd
        data={buildArticleLd(
          {
            title: page.title,
            slug: page.slug,
            description,
            datePublished: page.created_at,
            dateModified: page.updated_at,
          },
          'en',
        )}
      />
      <BlogArticle locale="en" page={page} />
    </>
  );
}
