import type { Metadata } from 'next';

import { staticPageMetadata } from '@/lib/page-seo';

import RouteView from '../../derechos-arco/view';

export function generateMetadata(): Metadata {
  return staticPageMetadata('/derechos-arco', 'en');
}

export default function Page() {
  return <RouteView />;
}
