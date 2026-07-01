import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { JsonLd } from '@/components/seo/JsonLd';
import {
  buildPersonLd,
  fetchAgentMeta,
  hreflangFor,
  listPublicAgentSlugs,
} from '@/lib/seo-server';

import RouteView from './view';

type PageProps = { params: Promise<{ slug: string }> };

// Espejo inglés de /agentes/[slug]. Mismos params/ISR; locale fijo 'en'.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await listPublicAgentSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const agent = await fetchAgentMeta(slug);

  if (!agent) {
    return { title: 'Agent not found', robots: { index: false, follow: false } };
  }

  const title = agent.display_name;
  const description =
    (agent.bio.en || '').substring(0, 160) ||
    `${agent.display_name}, real estate advisor at YR Inmobiliaria in Oaxaca.`;

  return {
    title,
    description,
    alternates: hreflangFor(`/agentes/${slug}`, 'en'),
    openGraph: {
      title,
      description,
      images: agent.photo_url ? [agent.photo_url] : undefined,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const agent = await fetchAgentMeta(slug);

  // Igual que la ruta ES: 404 real para agentes inexistentes.
  if (!agent) {
    notFound();
  }

  return (
    <>
      <JsonLd data={buildPersonLd(agent, 'en')} />
      <RouteView />
    </>
  );
}
