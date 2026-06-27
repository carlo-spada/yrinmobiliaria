'use client';

import dynamic from 'next/dynamic';

import { PageLoader } from '@/components/ui/page-loader';

const View = dynamic(() => import('@/screens/admin/AdminProperties'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function RouteView() {
  return <View />;
}
