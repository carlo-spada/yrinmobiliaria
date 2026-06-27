'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';

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
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    initGA();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider initialLanguage={initialLanguage}>
          {children}
          <Toaster />
          <Sonner />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
