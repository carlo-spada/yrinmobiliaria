'use client';

import { lazy, Suspense, useEffect, useState } from 'react';

const WhatsAppButton = lazy(() =>
  import('@/components/WhatsAppButton').then((module) => ({ default: module.WhatsAppButton }))
);

/** Botón flotante de WhatsApp diferido (equivalente al antiguo PublicAppShell). */
export function FloatingActions() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShow(true), 150);
    return () => window.clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <Suspense fallback={null}>
      <WhatsAppButton />
    </Suspense>
  );
}
