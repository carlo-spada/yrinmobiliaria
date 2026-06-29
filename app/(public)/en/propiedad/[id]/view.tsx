'use client';

import dynamic from 'next/dynamic';

import { PageLayout } from '@/components/layout';
import { PageLoader } from '@/components/ui/page-loader';

const View = dynamic(() => import('@/screens/PropertyDetail'), {
  ssr: false,
  loading: () => <PageLoader />,
});

// Espejo /en del view ES: mismo screen (lee el idioma del contexto, derivado de
// la URL), con el chrome a nivel de ruta (carga / no encontrado / contenido).
export default function RouteView() {
  return (
    <PageLayout>
      <View />
    </PageLayout>
  );
}
