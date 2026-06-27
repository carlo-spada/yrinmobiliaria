'use client';

import dynamic from 'next/dynamic';

import { RequireAuth } from '@/components/auth/NativeRouteGuards';
import { PageLoader } from '@/components/ui/page-loader';

const View = dynamic(() => import('@/screens/onboarding/CompleteProfile'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function RouteView() {
  return (
    <RequireAuth>
      <View />
    </RequireAuth>
  );
}
