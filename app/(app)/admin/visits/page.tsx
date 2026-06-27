import type { Metadata } from 'next';

import View from './view';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function Page() {
  return <View />;
}
