'use client';

import { useEffect, useState } from 'react';

import { logger } from '@/utils/logger';

// Último recurso del App Router: se activa cuando falla el propio layout raíz,
// por lo que reemplaza `<html>`/`<body>` y queda FUERA de `<Providers>`. Por eso
// no puede usar `LanguageContext` (lee el idioma de la cookie `locale`) ni
// depender del pipeline de CSS global (usa estilos en línea) — así renderiza
// aunque sea el propio estilado lo que falló.
const translations = {
  es: {
    lang: 'es',
    title: 'Algo salió mal',
    description:
      'Ha ocurrido un error inesperado. Por favor, intenta de nuevo o recarga la página.',
    tryAgain: 'Intentar de nuevo',
    reload: 'Recargar',
  },
  en: {
    lang: 'en',
    title: 'Something went wrong',
    description:
      'An unexpected error has occurred. Please try again or reload the page.',
    tryAgain: 'Try again',
    reload: 'Reload',
  },
} as const;

function readLocale(): 'es' | 'en' {
  if (typeof document === 'undefined') return 'es';
  const match = document.cookie.match(/(?:^|;\s*)locale=(es|en)/);
  return match?.[1] === 'en' ? 'en' : 'es';
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Empezamos en 'es' (idioma por defecto del sitio) y ajustamos tras montar
  // para evitar cualquier desajuste de hidratación.
  const [language, setLanguage] = useState<'es' | 'en'>('es');

  useEffect(() => {
    // Sincronizamos el idioma desde la cookie tras montar (no en el render
    // inicial) para no provocar un desajuste de hidratación si la página de
    // error se renderizó en el servidor con el idioma por defecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync cliente post-montaje
    setLanguage(readLocale());
    logger.error('Global error boundary caught:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  const t = translations[language];

  const buttonBase: React.CSSProperties = {
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid #d4d4d8',
  };

  return (
    <html lang={t.lang}>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fafafa',
          color: '#18181b',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
          padding: '1.5rem',
        }}
      >
        <div
          role="alert"
          style={{
            maxWidth: '28rem',
            width: '100%',
            backgroundColor: '#ffffff',
            border: '1px solid #e4e4e7',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <h1
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '0 0 0.75rem',
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#dc2626',
            }}
          >
            <span aria-hidden="true">⚠️</span>
            {t.title}
          </h1>
          <p style={{ margin: '0 0 1.25rem', color: '#52525b', lineHeight: 1.5 }}>
            {t.description}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={reset}
              style={{ ...buttonBase, backgroundColor: '#ffffff', color: '#18181b' }}
            >
              {t.tryAgain}
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                ...buttonBase,
                backgroundColor: '#18181b',
                color: '#ffffff',
                borderColor: '#18181b',
              }}
            >
              {t.reload}
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
