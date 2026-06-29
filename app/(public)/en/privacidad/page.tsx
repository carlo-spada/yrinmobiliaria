import type { Metadata } from 'next';

import { staticPageMetadata } from '@/lib/page-seo';

import RouteView from '../../privacidad/view';

export function generateMetadata(): Metadata {
  return staticPageMetadata('/privacidad', 'en');
}

export default function Page() {
  return <RouteView />;
}
