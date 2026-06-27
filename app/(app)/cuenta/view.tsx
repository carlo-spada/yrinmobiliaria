'use client';

import dynamic from 'next/dynamic';

import { PageLoader } from '@/components/ui/page-loader';

// UserDashboard se auto-protege (redirige a /auth si no hay sesión, a /admin si
// es staff), así que no necesita guard envolvente — paridad con la ruta legacy.
const View = dynamic(() => import('@/screens/user/UserDashboard'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function RouteView() {
  return <View />;
}
