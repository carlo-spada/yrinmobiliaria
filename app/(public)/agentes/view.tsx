'use client';

import dynamic from 'next/dynamic';

import { PageLayout } from '@/components/layout';
import { PageLoader } from '@/components/ui/page-loader';

const View = dynamic(() => import('@/screens/AgentDirectory'), {
  ssr: false,
  loading: () => <PageLoader />,
});

// Header/Footer a nivel de ruta: AgentDirectory no renderiza el chrome propio.
export default function RouteView() {
  return (
    <PageLayout>
      <View />
    </PageLayout>
  );
}
