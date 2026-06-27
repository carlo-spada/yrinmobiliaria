import type { Metadata } from 'next';

import { getServerLocale, hreflangFor } from '@/lib/seo-server';

import RouteView from './view';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = locale === 'es' ? 'Agenda una visita' : 'Schedule a visit';
  const description = locale === 'es'
    ? 'Agenda una visita a la propiedad que te interesa con un asesor de YR Inmobiliaria.'
    : 'Schedule a visit to the property you are interested in with a YR Inmobiliaria advisor.';
  return {
    title,
    description,
    alternates: hreflangFor('/agendar'),
    openGraph: { title, description },
  };
}

export default function Page() {
  return <RouteView />;
}
