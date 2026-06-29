import type { Metadata } from 'next';

import { staticPageMetadata } from '@/lib/page-seo';

import RouteView from '../../agendar/view';

export function generateMetadata(): Metadata {
  return staticPageMetadata('/agendar', 'en');
}

export default function Page() {
  return <RouteView />;
}
