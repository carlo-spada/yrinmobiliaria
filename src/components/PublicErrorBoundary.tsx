'use client';

import type { ReactNode } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Envuelve las pantallas públicas en el `ErrorBoundary` genérico, inyectando el
 * idioma actual del `LanguageContext` para que el fallback respete ES/EN. Un
 * error de render en una pantalla pública (cargada vía `view.tsx` con
 * `ssr:false`) se contiene aquí en lugar de propagar a la frontera de Next.
 */
export function PublicErrorBoundary({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  return <ErrorBoundary language={language}>{children}</ErrorBoundary>;
}
