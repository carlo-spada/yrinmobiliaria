'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { pageview } from '@/utils/analytics';

/**
 * Envía una vista de página a GA en cada cambio de ruta (App Router = navegación
 * de cliente). Con `send_page_view:false` en la config, esto produce exactamente
 * una vista por página (incluida la inicial). No-op si GA no está cargada o el
 * usuario no dio consentimiento (Consent Mode lo modela sin cookies).
 */
export function AnalyticsPageviews() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) pageview(pathname);
  }, [pathname]);

  return null;
}
