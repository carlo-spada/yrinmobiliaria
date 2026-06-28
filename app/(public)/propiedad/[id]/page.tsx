import type { Metadata } from 'next';

import { JsonLd } from '@/components/seo/JsonLd';
import {
  buildBreadcrumbLd,
  buildProductLd,
  fetchPropertyMeta,
  formatMXN,
  getServerLocale,
  hreflangFor,
  listPublicPropertyIds,
  SITE_URL,
} from '@/lib/seo-server';

import RouteView from './view';

type PageProps = { params: Promise<{ id: string }> };

// ISR: prerenderiza cada propiedad disponible en build y revalida cada hora.
// `dynamicParams` deja que las propiedades nuevas (no incluidas en el build) se
// generen on-demand y se cacheen. El cuerpo es `ssr:false`, así que lo que se
// prerenderiza es el chrome + metadata + JSON-LD (la superficie SEO).
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const ids = await listPublicPropertyIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const locale = await getServerLocale();
  const property = await fetchPropertyMeta(id);

  if (!property) {
    return {
      title: locale === 'es' ? 'Propiedad no encontrada' : 'Property not found',
      robots: { index: false, follow: false },
    };
  }

  const title = `${property.title[locale]} - ${formatMXN(property.price)} - ${property.zone}`;
  const description =
    (property.description[locale] || '').substring(0, 160) ||
    `${property.title[locale]} en ${property.zone}.`;

  return {
    title,
    description,
    alternates: hreflangFor(`/propiedad/${id}`),
    openGraph: {
      title,
      description,
      images: property.images[0] ? [property.images[0]] : undefined,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const locale = await getServerLocale();
  const property = await fetchPropertyMeta(id);

  const breadcrumb = property
    ? buildBreadcrumbLd([
        { name: locale === 'es' ? 'Inicio' : 'Home', url: SITE_URL },
        { name: locale === 'es' ? 'Propiedades' : 'Properties', url: `${SITE_URL}/propiedades` },
        { name: property.title[locale], url: `${SITE_URL}/propiedad/${id}` },
      ])
    : null;

  return (
    <>
      {property && <JsonLd data={buildProductLd(property, locale)} />}
      {breadcrumb && <JsonLd data={breadcrumb} />}
      <RouteView />
    </>
  );
}
