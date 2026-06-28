'use client';

import dynamic from 'next/dynamic';

import { PageLayout } from '@/components/layout';
import { PageLoader } from '@/components/ui/page-loader';

const View = dynamic(() => import('@/screens/AgentProfile'), {
  ssr: false,
  loading: () => <PageLoader />,
});

// Header/Footer a nivel de ruta: AgentProfile no renderiza el chrome propio
// (cubre los estados de carga / no encontrado / contenido).
export default function RouteView() {
  return (
    <PageLayout>
      <View />
    </PageLayout>
  );
}
