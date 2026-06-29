import type { Metadata } from 'next';

import { BlogIndex } from '@/components/blog/BlogIndex';
import { listPublishedCmsPages } from '@/lib/cms';
import { staticPageMetadata } from '@/lib/page-seo';

// ISR: el índice del blog lee cms_pages publicadas; revalida cada hora.
export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return staticPageMetadata('/blog', 'es');
}

export default async function Page() {
  const posts = await listPublishedCmsPages();
  return <BlogIndex locale="es" posts={posts} />;
}
