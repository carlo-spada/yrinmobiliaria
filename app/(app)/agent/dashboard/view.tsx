'use client';

import dynamic from 'next/dynamic';

import { RequireRole } from '@/components/auth/NativeRouteGuards';
import { PageLoader } from '@/components/ui/page-loader';

const View = dynamic(() => import('@/screens/agent/AgentDashboard'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function RouteView() {
  return (
    <RequireRole allowedRoles={['agent', 'admin', 'superadmin']} requireCompletedProfile>
      <View />
    </RequireRole>
  );
}
