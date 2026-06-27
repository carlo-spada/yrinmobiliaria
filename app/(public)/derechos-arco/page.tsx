import type { Metadata } from 'next';

import { getServerLocale, hreflangFor } from '@/lib/seo-server';

import RouteView from './view';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = locale === 'es' ? 'Derechos ARCO' : 'Data rights (ARCO)';
  const description = locale === 'es'
    ? 'Ejerce tus derechos de Acceso, Rectificación, Cancelación u Oposición sobre tus datos personales.'
    : 'Exercise your rights of Access, Rectification, Cancellation, or Opposition over your personal data.';
  return {
    title,
    description,
    alternates: hreflangFor('/derechos-arco'),
  };
}

export default function Page() {
  return <RouteView />;
}
