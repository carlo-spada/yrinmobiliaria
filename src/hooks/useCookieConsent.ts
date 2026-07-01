'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';

import { GA_CONFIGURED, readConsent, updateConsent, type ConsentDecision } from '@/utils/analytics';

// Suscripción vacía: solo usamos useSyncExternalStore para obtener un flag
// "hidratado" seguro (false en SSR y en el render de hidratación, true tras
// montar) sin setState dentro de un effect.
const emptySubscribe = () => () => {};

/**
 * Estado del consentimiento de cookies de análisis. El banner solo se muestra
 * cuando: hay GA configurada, ya hidratamos en cliente (evita parpadeo/mismatch)
 * y el usuario aún no decidió. `accept`/`reject` actualizan Consent Mode + persisten.
 */
export function useCookieConsent() {
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [decision, setDecision] = useState<ConsentDecision | null>(() => readConsent());

  const decide = useCallback((granted: boolean) => {
    updateConsent(granted);
    setDecision(granted ? 'granted' : 'denied');
  }, []);

  return {
    decision,
    showBanner: hydrated && GA_CONFIGURED && decision === null,
    accept: useCallback(() => decide(true), [decide]),
    reject: useCallback(() => decide(false), [decide]),
  };
}
