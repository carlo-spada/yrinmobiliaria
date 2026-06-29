import type { Metadata } from 'next';

import { BlogIndex } from '@/components/blog/BlogIndex';
import { listPublishedCmsPages } from '@/lib/cms';
import { staticPageMetadata } from '@/lib/page-seo';

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return staticPageMetadata('/blog', 'en');
}

export default async function Page() {
  const posts = await listPublishedCmsPages();
  return <BlogIndex locale="en" posts={posts} />;
}
