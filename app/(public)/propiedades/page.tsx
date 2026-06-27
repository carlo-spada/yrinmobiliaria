import type { Metadata } from 'next';

import { getServerLocale, hreflangFor } from '@/lib/seo-server';

import RouteView from './view';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = locale === 'es'
    ? 'Propiedades en venta y renta en Oaxaca'
    : 'Properties for sale and rent in Oaxaca';
  const description = locale === 'es'
    ? 'Explora casas, departamentos, terrenos y locales en Oaxaca. Filtra por zona, precio y tipo de operación.'
    : 'Browse houses, apartments, land and commercial spaces in Oaxaca. Filter by zone, price and operation type.';
  return {
    title,
    description,
    alternates: hreflangFor('/propiedades'),
    openGraph: { title, description },
  };
}

export default function Page() {
  return <RouteView />;
}
