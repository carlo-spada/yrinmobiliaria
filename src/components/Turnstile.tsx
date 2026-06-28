import { useEffect, useRef } from 'react';

import { env } from '@/lib/env';

// Widget de Cloudflare Turnstile (anti-abuso). Si no hay site key configurada,
// no renderiza nada y el formulario sigue funcionando (honeypot + rate-limit en
// el servidor siguen activos). El token se entrega vía `onToken`; se limpia a ''
// al expirar/errar para que el caller no envíe un token caducado.
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
    },
  ) => string;
  remove: (id: string) => void;
  reset: (id?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  // Ref para el callback → el efecto se monta una sola vez (no se re-inicializa
  // el widget en cada render del formulario padre).
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  const siteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    let interval: number | undefined;

    const renderWidget = () => {
      if (cancelled || !containerRef.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => onTokenRef.current(token),
        'expired-callback': () => onTokenRef.current(''),
        'error-callback': () => onTokenRef.current(''),
      });
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      if (!document.querySelector('script[data-turnstile]')) {
        const script = document.createElement('script');
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.setAttribute('data-turnstile', '');
        document.head.appendChild(script);
      }
      interval = window.setInterval(() => {
        if (window.turnstile) {
          window.clearInterval(interval);
          renderWidget();
        }
      }, 200);
    }

    return () => {
      cancelled = true;
      if (interval) window.clearInterval(interval);
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* widget ya removido */
        }
        widgetId.current = null;
      }
    };
  }, [siteKey]);

  if (!siteKey) return null;
  return <div ref={containerRef} className="flex justify-center" />;
}
