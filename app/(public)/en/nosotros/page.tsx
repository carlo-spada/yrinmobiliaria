import type { Metadata } from 'next';

import { staticPageMetadata } from '@/lib/page-seo';

import RouteView from '../../nosotros/view';

export function generateMetadata(): Metadata {
  return staticPageMetadata('/nosotros', 'en');
}

export default function Page() {
  return <RouteView />;
}
