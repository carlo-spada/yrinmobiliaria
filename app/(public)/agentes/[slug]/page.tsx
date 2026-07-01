import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { JsonLd } from '@/components/seo/JsonLd';
import {
  buildPersonLd,
  fetchAgentMeta,
  getServerLocale,
  hreflangFor,
  listPublicAgentSlugs,
} from '@/lib/seo-server';

import RouteView from './view';

type PageProps = { params: Promise<{ slug: string }> };

// ISR: prerenderiza cada agente del directorio público y revalida cada hora.
// `dynamicParams` cubre agentes nuevos on-demand.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await listPublicAgentSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getServerLocale();
  const agent = await fetchAgentMeta(slug);

  if (!agent) {
    return {
      title: locale === 'es' ? 'Agente no encontrado' : 'Agent not found',
      robots: { index: false, follow: false },
    };
  }

  const title = agent.display_name;
  const description =
    (agent.bio[locale] || '').substring(0, 160) ||
    (locale === 'es'
      ? `${agent.display_name}, asesor inmobiliario de YR Inmobiliaria en Oaxaca.`
      : `${agent.display_name}, real estate advisor at YR Inmobiliaria in Oaxaca.`);

  return {
    title,
    description,
    alternates: hreflangFor(`/agentes/${slug}`),
    openGraph: {
      title,
      description,
      images: agent.photo_url ? [agent.photo_url] : undefined,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const locale = await getServerLocale();
  const agent = await fetchAgentMeta(slug);

  // Agente inexistente → 404 real (status HTTP 404, cacheado por ISR como tal).
  if (!agent) {
    notFound();
  }

  return (
    <>
      <JsonLd data={buildPersonLd(agent, locale)} />
      <RouteView />
    </>
  );
}
