'use client';

import dynamic from 'next/dynamic';

import { PageLoader } from '@/components/ui/page-loader';

// El guard de rol (agent/admin/superadmin + perfil completo) se aplica a nivel
// de ruta en `app/(app)/agent/layout.tsx`, así que el view solo carga el screen.
const View = dynamic(() => import('@/screens/agent/EditProfile'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function RouteView() {
  return <View />;
}
