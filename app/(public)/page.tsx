import type { Metadata } from 'next';

import { JsonLd } from '@/components/seo/JsonLd';
import {
  buildLocalBusinessLd,
  buildOrganizationLd,
  getPublicSiteSettings,
  getServerLocale,
  hreflangFor,
} from '@/lib/seo-server';

import RouteView from './view';

// ISR: el JSON-LD lee la NAP/redes de site_settings; revalida cada hora para
// reflejar cambios del panel de admin sin redeploy (alineado con sitemap/PDP).
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const title =
    locale === 'es'
      ? 'YR Inmobiliaria - Bienes Raíces en Oaxaca'
      : 'YR Inmobiliaria - Real Estate in Oaxaca';
  const description =
    locale === 'es'
      ? 'Expertos en bienes raíces en Oaxaca, México. Encuentra tu hogar perfecto con más de 10 años de experiencia.'
      : 'Real estate experts in Oaxaca, Mexico. Find your perfect home with over 10 years of experience.';
  return {
    title: { absolute: title },
    description,
    alternates: hreflangFor('/'),
    openGraph: { title, description },
  };
}

export default async function Page() {
  const [locale, settings] = await Promise.all([getServerLocale(), getPublicSiteSettings()]);
  return (
    <>
      <JsonLd data={buildOrganizationLd(locale, settings)} />
      <JsonLd data={buildLocalBusinessLd(locale, settings)} />
      <RouteView />
    </>
  );
}
