import type { Metadata } from 'next';

import { LegacyIsland } from '@/components/legacy/LegacyIsland';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function Page() {
  return <LegacyIsland />;
}
