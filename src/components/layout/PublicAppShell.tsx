import { lazy, Suspense, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

const LazyWhatsAppButton = lazy(() =>
  import('@/components/WhatsAppButton').then((module) => ({
    default: module.WhatsAppButton,
  }))
);

export function PublicAppShell() {
  const [showFloatingActions, setShowFloatingActions] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setShowFloatingActions(true);
    }, 150);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <Outlet />
      {showFloatingActions ? (
        <Suspense fallback={null}>
          <LazyWhatsAppButton />
        </Suspense>
      ) : null}
    </>
  );
}
