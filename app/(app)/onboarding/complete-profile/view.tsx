'use client';

import dynamic from 'next/dynamic';

import { PageLoader } from '@/components/ui/page-loader';

// El guard de sesión se aplica a nivel de ruta en
// `app/(app)/onboarding/layout.tsx` (RequireAuth), así que el view solo carga
// el screen.
const View = dynamic(() => import('@/screens/onboarding/CompleteProfile'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function RouteView() {
  return <View />;
}
