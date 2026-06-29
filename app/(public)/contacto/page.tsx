import type { Metadata } from 'next';

import { staticPageMetadata } from '@/lib/page-seo';

import RouteView from './view';

export function generateMetadata(): Metadata {
  return staticPageMetadata('/contacto', 'es');
}

export default function Page() {
  return <RouteView />;
}
