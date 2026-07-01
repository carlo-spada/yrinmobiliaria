'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';

import { AnalyticsPageviews } from '@/components/AnalyticsPageviews';
import { CookieConsent } from '@/components/CookieConsent';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LanguageProvider } from '@/contexts/LanguageContext';
import type { Language } from '@/types';
import { initGA } from '@/utils/analytics';

export function Providers({
  children,
  initialLanguage,
}: {
  children: ReactNode;
  initialLanguage: Language;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // El refetch al volver a la pestaña duplica llamadas sin valor real
            // para un catálogo que cambia poco; un solo reintento y un staleTime
            // de 1 min recortan tráfico a Supabase sin servir datos rancios.
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 60_000,
          },
        },
      })
  );

  useEffect(() => {
    initGA();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider initialLanguage={initialLanguage}>
          {children}
          <AnalyticsPageviews />
          <CookieConsent />
          <Toaster />
          <Sonner />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
