'use client';

import dynamic from 'next/dynamic';

import { PageLayout } from '@/components/layout';
import { PageLoader } from '@/components/ui/page-loader';

const View = dynamic(() => import('@/screens/PropertyDetail'), {
  ssr: false,
  loading: () => <PageLoader />,
});

// El chrome (Header/Footer) se aplica aquí, a nivel de ruta, para que TODOS los
// estados del screen (carga / no encontrado / contenido) lo tengan. El screen
// PropertyDetail no renderiza Header/Footer por su cuenta.
export default function RouteView() {
  return (
    <PageLayout>
      <View />
    </PageLayout>
  );
}
