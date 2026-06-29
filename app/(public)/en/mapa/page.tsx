import type { Metadata } from 'next';

import { staticPageMetadata } from '@/lib/page-seo';

import RouteView from '../../mapa/view';

export function generateMetadata(): Metadata {
  return staticPageMetadata('/mapa', 'en');
}

export default function Page() {
  return <RouteView />;
}
