'use client';

import dynamic from 'next/dynamic';

import { PageLoader } from '@/components/ui/page-loader';

const NotFoundPage = dynamic(() => import('@/screens/NotFound'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function NotFoundView() {
  return <NotFoundPage />;
}
