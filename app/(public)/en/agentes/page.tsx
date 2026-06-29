import type { Metadata } from 'next';

import { staticPageMetadata } from '@/lib/page-seo';

import RouteView from '../../agentes/view';

export function generateMetadata(): Metadata {
  return staticPageMetadata('/agentes', 'en');
}

export default function Page() {
  return <RouteView />;
}
