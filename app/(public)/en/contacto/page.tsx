import type { Metadata } from 'next';

import { staticPageMetadata } from '@/lib/page-seo';

import RouteView from '../../contacto/view';

export function generateMetadata(): Metadata {
  return staticPageMetadata('/contacto', 'en');
}

export default function Page() {
  return <RouteView />;
}
