'use client';

import { BrowserRouter } from 'react-router-dom';

import { ScrollToTop } from '@/components/ScrollToTop';
import { AppRoutes } from '@/routes';

/**
 * Isla legacy: monta el árbol de React Router del SPA original para servir las
 * rutas privadas (auth, onboarding, cuenta, agent/*, admin/*) sin reescribirlas.
 * Los providers globales (QueryClient, Language, Tooltip, Toaster) los aporta el
 * root layout de Next; aquí solo se añade el router de cliente. Las rutas
 * públicas ya son páginas Next nativas y no se navegan a través de esta isla.
 */
export default function LegacyApp() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
}
