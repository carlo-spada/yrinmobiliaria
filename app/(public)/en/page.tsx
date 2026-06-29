import type { Metadata } from 'next';

import { JsonLd } from '@/components/seo/JsonLd';
import {
  buildLocalBusinessLd,
  buildOrganizationLd,
  getPublicSiteSettings,
  hreflangFor,
} from '@/lib/seo-server';

import RouteView from '../view';

// ISR: el JSON-LD lee la NAP/redes de site_settings; revalida cada hora (igual
// que la home ES) para reflejar cambios del panel sin redeploy.
export const revalidate = 3600;

export function generateMetadata(): Metadata {
  const title = 'YR Inmobiliaria - Real Estate in Oaxaca';
  const description =
    'Real estate experts in Oaxaca, Mexico. Find your perfect home with over 10 years of experience.';
  return {
    title: { absolute: title },
    description,
    alternates: hreflangFor('/', 'en'),
    openGraph: { title, description },
  };
}

export default async function Page() {
  const settings = await getPublicSiteSettings();
  return (
    <>
      <JsonLd data={buildOrganizationLd('en', settings)} />
      <JsonLd data={buildLocalBusinessLd('en', settings)} />
      <RouteView />
    </>
  );
}
