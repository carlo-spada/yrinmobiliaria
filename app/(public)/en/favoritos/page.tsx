import type { Metadata } from 'next';

import { staticPageMetadata } from '@/lib/page-seo';

import RouteView from '../../favoritos/view';

export function generateMetadata(): Metadata {
  return staticPageMetadata('/favoritos', 'en');
}

export default function Page() {
  return <RouteView />;
}
