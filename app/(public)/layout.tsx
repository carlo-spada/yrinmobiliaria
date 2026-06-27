import type { ReactNode } from 'react';

import { FloatingActions } from './floating-actions';

// El "chrome" (Header/Footer) lo renderiza cada página pública internamente,
// así que este layout solo añade las acciones flotantes globales.
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <FloatingActions />
    </>
  );
}
