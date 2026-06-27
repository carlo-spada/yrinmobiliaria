import type { Metadata } from 'next';

import { getServerLocale, hreflangFor } from '@/lib/seo-server';

import RouteView from './view';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = locale === 'es' ? 'Términos y condiciones' : 'Terms of service';
  const description = locale === 'es'
    ? 'Términos y condiciones de uso de YR Inmobiliaria.'
    : 'Terms and conditions of use of YR Inmobiliaria.';
  return {
    title,
    description,
    alternates: hreflangFor('/terminos'),
  };
}

export default function Page() {
  return <RouteView />;
}
