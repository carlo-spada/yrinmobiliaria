'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/utils/logger';

// Error boundary a nivel de segmento (App Router). Captura errores de render de
// las rutas que cuelgan del layout raíz, conservando el `<Providers>` (por eso
// puede usar `useLanguage`). Para fallos del propio layout raíz existe
// `app/global-error.tsx`.
const translations = {
  es: {
    title: 'Algo salió mal',
    description:
      'Ha ocurrido un error inesperado. Por favor, intenta de nuevo o recarga la página.',
    tryAgain: 'Intentar de nuevo',
    reload: 'Recargar',
  },
  en: {
    title: 'Something went wrong',
    description:
      'An unexpected error has occurred. Please try again or reload the page.',
    tryAgain: 'Try again',
    reload: 'Reload',
  },
} as const;

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { language } = useLanguage();
  const t = translations[language] ?? translations.es;

  useEffect(() => {
    logger.error('Route error boundary caught:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <Card className="max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{t.description}</p>
        {process.env.NODE_ENV === 'development' && (
          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
            {error.message}
          </pre>
        )}
        <div className="flex gap-2">
          <Button onClick={reset} variant="outline">
            {t.tryAgain}
          </Button>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t.reload}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
