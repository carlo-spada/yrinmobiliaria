import type { Metadata } from 'next';

import { getServerLocale, hreflangFor } from '@/lib/seo-server';

import RouteView from './view';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = locale === 'es' ? 'Aviso de privacidad' : 'Privacy policy';
  const description = locale === 'es'
    ? 'Aviso de privacidad de YR Inmobiliaria.'
    : 'Privacy policy of YR Inmobiliaria.';
  return {
    title,
    description,
    alternates: hreflangFor('/privacidad'),
  };
}

export default function Page() {
  return <RouteView />;
}
