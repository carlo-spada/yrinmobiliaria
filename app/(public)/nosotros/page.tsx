import type { Metadata } from 'next';

import { getServerLocale, hreflangFor } from '@/lib/seo-server';

import RouteView from './view';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = locale === 'es' ? 'Nosotros' : 'About us';
  const description = locale === 'es'
    ? 'Conoce a YR Inmobiliaria: más de 10 años de experiencia en bienes raíces en Oaxaca.'
    : 'Meet YR Inmobiliaria: over 10 years of real estate experience in Oaxaca.';
  return {
    title,
    description,
    alternates: hreflangFor('/nosotros'),
    openGraph: { title, description },
  };
}

export default function Page() {
  return <RouteView />;
}
