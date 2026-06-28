import type { ReactNode } from 'react';

import { PublicErrorBoundary } from '@/components/PublicErrorBoundary';

import { FloatingActions } from './floating-actions';

// El "chrome" (Header/Footer) lo renderiza cada página pública internamente,
// así que este layout solo añade las acciones flotantes globales y envuelve las
// pantallas en un ErrorBoundary para contener fallos de render del cliente.
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicErrorBoundary>{children}</PublicErrorBoundary>
      <FloatingActions />
    </>
  );
}
