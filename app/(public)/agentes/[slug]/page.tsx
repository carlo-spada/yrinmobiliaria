import type { Metadata } from 'next';

import { JsonLd } from '@/components/seo/JsonLd';
import {
  buildPersonLd,
  fetchAgentMeta,
  getServerLocale,
  hreflangFor,
} from '@/lib/seo-server';

import RouteView from './view';

type PageProps = { params: Promise<{ slug: string }> };

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

  return (
    <>
      {agent && <JsonLd data={buildPersonLd(agent, locale)} />}
      <RouteView />
    </>
  );
}
