import type { Metadata } from 'next';

import { staticPageMetadata } from '@/lib/page-seo';

import RouteView from '../../propiedades/view';

export function generateMetadata(): Metadata {
  return staticPageMetadata('/propiedades', 'en');
}

export default function Page() {
  return <RouteView />;
}
