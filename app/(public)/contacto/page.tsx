import type { Metadata } from 'next';

import { getServerLocale, hreflangFor } from '@/lib/seo-server';

import RouteView from './view';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = locale === 'es' ? 'Contacto' : 'Contact';
  const description = locale === 'es'
    ? 'Ponte en contacto con YR Inmobiliaria. Estamos para ayudarte a encontrar tu próxima propiedad en Oaxaca.'
    : 'Get in touch with YR Inmobiliaria. We are here to help you find your next property in Oaxaca.';
  return {
    title,
    description,
    alternates: hreflangFor('/contacto'),
    openGraph: { title, description },
  };
}

export default function Page() {
  return <RouteView />;
}
