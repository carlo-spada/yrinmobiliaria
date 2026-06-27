'use client';

import dynamic from 'next/dynamic';

import { PageLoader } from '@/components/ui/page-loader';

// Los screens admin se auto-envuelven en AdminLayout (sidebar/header + guard
// auth/isStaff/perfil), así que el view solo carga el screen en cliente.
const View = dynamic(() => import('@/screens/admin/AdminDashboard'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function RouteView() {
  return <View />;
}
