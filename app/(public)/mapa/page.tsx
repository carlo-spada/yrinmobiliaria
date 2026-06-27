import type { Metadata } from 'next';

import { getServerLocale, hreflangFor } from '@/lib/seo-server';

import RouteView from './view';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = locale === 'es' ? 'Mapa de propiedades en Oaxaca' : 'Property map in Oaxaca';
  const description = locale === 'es'
    ? 'Encuentra propiedades por ubicación en el mapa interactivo de Oaxaca.'
    : 'Find properties by location on the interactive map of Oaxaca.';
  return {
    title,
    description,
    alternates: hreflangFor('/mapa'),
    openGraph: { title, description },
  };
}

export default function Page() {
  return <RouteView />;
}
