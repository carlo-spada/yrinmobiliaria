import type { Metadata } from 'next';

import { getServerLocale, hreflangFor } from '@/lib/seo-server';

import RouteView from './view';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = locale === 'es' ? 'Tus propiedades favoritas' : 'Your favorite properties';
  const description = locale === 'es'
    ? 'Las propiedades que guardaste en YR Inmobiliaria.'
    : 'The properties you saved at YR Inmobiliaria.';
  return {
    title,
    description,
    alternates: hreflangFor('/favoritos'),
    robots: { index: false, follow: false },
  };
}

export default function Page() {
  return <RouteView />;
}
