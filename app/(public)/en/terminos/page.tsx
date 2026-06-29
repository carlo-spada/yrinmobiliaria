import type { Metadata } from 'next';

import { staticPageMetadata } from '@/lib/page-seo';

import RouteView from '../../terminos/view';

export function generateMetadata(): Metadata {
  return staticPageMetadata('/terminos', 'en');
}

export default function Page() {
  return <RouteView />;
}
