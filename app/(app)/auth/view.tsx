'use client';

import dynamic from 'next/dynamic';

import { PageLoader } from '@/components/ui/page-loader';

// La pantalla de login es pública (redirige a /admin o /cuenta tras autenticar).
const View = dynamic(() => import('@/screens/Auth'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function RouteView() {
  return <View />;
}
