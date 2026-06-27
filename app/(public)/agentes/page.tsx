import type { Metadata } from 'next';

import { getServerLocale, hreflangFor } from '@/lib/seo-server';

import RouteView from './view';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = locale === 'es' ? 'Nuestros agentes' : 'Our agents';
  const description = locale === 'es'
    ? 'Conoce al equipo de asesores inmobiliarios de YR Inmobiliaria en Oaxaca.'
    : 'Meet the team of real estate advisors at YR Inmobiliaria in Oaxaca.';
  return {
    title,
    description,
    alternates: hreflangFor('/agentes'),
    openGraph: { title, description },
  };
}

export default function Page() {
  return <RouteView />;
}
