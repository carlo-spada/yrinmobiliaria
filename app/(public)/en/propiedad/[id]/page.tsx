import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { JsonLd } from '@/components/seo/JsonLd';
import {
  buildBreadcrumbLd,
  buildProductLd,
  fetchPropertyMeta,
  formatMXN,
  hreflangFor,
  listPublicPropertyIds,
  SITE_URL,
} from '@/lib/seo-server';

import RouteView from './view';

type PageProps = { params: Promise<{ id: string }> };

// Espejo inglés de /propiedad/[id]. Mismos params/ISR que la ruta ES; locale fijo
// 'en' para metadata + JSON-LD. El cuerpo es `ssr:false`.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const ids = await listPublicPropertyIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await fetchPropertyMeta(id);

  if (!property) {
    return { title: 'Property not found', robots: { index: false, follow: false } };
  }

  const title = `${property.title.en} - ${formatMXN(property.price)} - ${property.zone}`;
  const description =
    (property.description.en || '').substring(0, 160) || `${property.title.en} in ${property.zone}.`;

  return {
    title,
    description,
    alternates: hreflangFor(`/propiedad/${id}`, 'en'),
    openGraph: {
      title,
      description,
      images: property.images[0] ? [property.images[0]] : undefined,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const property = await fetchPropertyMeta(id);

  // Igual que la ruta ES: 404 real para propiedades inexistentes / ids inválidos.
  if (!property) {
    notFound();
  }

  const breadcrumb = buildBreadcrumbLd([
    { name: 'Home', url: `${SITE_URL}/en` },
    { name: 'Properties', url: `${SITE_URL}/en/propiedades` },
    { name: property.title.en, url: `${SITE_URL}/en/propiedad/${id}` },
  ]);

  return (
    <>
      <JsonLd data={buildProductLd(property, 'en')} />
      <JsonLd data={breadcrumb} />
      <RouteView />
    </>
  );
}
