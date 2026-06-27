'use client';

import dynamic from 'next/dynamic';

import { PageLoader } from '@/components/ui/page-loader';

// El árbol de React Router es estrictamente de cliente (BrowserRouter, acceso a
// window), así que se carga sin SSR.
const LegacyApp = dynamic(() => import('@/components/legacy/LegacyApp'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export function LegacyIsland() {
  return <LegacyApp />;
}
