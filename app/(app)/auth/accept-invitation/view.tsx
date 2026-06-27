'use client';

import dynamic from 'next/dynamic';

import { PageLoader } from '@/components/ui/page-loader';

// El flujo de aceptar invitación valida el token y crea la sesión del agente;
// es público (el usuario aún no está autenticado al abrir el enlace).
const View = dynamic(() => import('@/screens/auth/AcceptInvitation'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function RouteView() {
  return <View />;
}
