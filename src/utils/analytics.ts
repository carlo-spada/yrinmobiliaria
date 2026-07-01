// Google Analytics (GA4) con Consent Mode v2.
// Solo se activa si NEXT_PUBLIC_GA_MEASUREMENT_ID está configurada. El
// almacenamiento de analytics arranca DENEGADO; el banner de cookies lo concede
// tras el consentimiento explícito del usuario.

import { env } from '@/lib/env';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const GA_MEASUREMENT_ID = env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/** ¿Hay GA configurada? Si no, no cargamos nada ni mostramos el banner. */
export const GA_CONFIGURED = Boolean(GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'undefined');

export type ConsentDecision = 'granted' | 'denied';
const CONSENT_STORAGE_KEY = 'cookie_consent';

/** Lee la decisión de consentimiento persistida (solo cliente). */
export function readConsent(): ConsentDecision | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

/** Persiste la decisión de consentimiento (solo cliente). */
export function storeConsent(decision: ConsentDecision): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, decision);
  } catch {
    /* almacenamiento no disponible: la decisión solo dura la sesión */
  }
}

/** Inicializa `dataLayer` + el shim de `gtag` de forma idempotente. */
function bootstrapGtag(): void {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function (...args: unknown[]) {
      window.dataLayer?.push(args);
    };
  }
}

let gaInitialized = false;

// Inicializa GA con Consent Mode v2. `analytics_storage` arranca según la
// decisión guardada (denegado por defecto); los estados de anuncios quedan
// SIEMPRE denegados (este sitio no hace publicidad). El banner concede el
// consentimiento vía `updateConsent`. Idempotente: en React StrictMode (dev) el
// effect corre dos veces y no queremos duplicar el script/config de gtag.
export const initGA = () => {
  if (!GA_CONFIGURED) {
    console.info('Google Analytics not configured. Add NEXT_PUBLIC_GA_MEASUREMENT_ID to enable tracking.');
    return;
  }
  if (gaInitialized) return;
  gaInitialized = true;

  bootstrapGtag();

  const stored = readConsent();
  window.gtag!('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: stored === 'granted' ? 'granted' : 'denied',
    wait_for_update: 500,
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.gtag!('js', new Date());
  window.gtag!('config', GA_MEASUREMENT_ID, {
    // Las vistas de página SPA las envía `AnalyticsPageviews` en cada cambio de
    // ruta (evita el doble conteo del page_view inicial de gtag).
    send_page_view: false,
    cookie_flags: 'SameSite=None;Secure',
  });
};

/**
 * Actualiza el consentimiento de analytics (lo llama el banner de cookies) y lo
 * persiste. En Consent Mode v2, `granted` habilita las cookies de GA.
 */
export function updateConsent(granted: boolean): void {
  const decision: ConsentDecision = granted ? 'granted' : 'denied';
  storeConsent(decision);
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', { analytics_storage: decision });
  }
}

export const pageview = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: url,
    page_location: window.location.href,
  });
};

export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (!window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Specific event helpers
export const trackPropertyView = (propertyId: string, propertyName: string) => {
  event({
    action: 'view_property',
    category: 'Property',
    label: `${propertyId} - ${propertyName}`,
  });
};

export const trackPropertyContact = (propertyId: string, method: string) => {
  event({
    action: 'contact',
    category: 'Property',
    label: `${propertyId} - ${method}`,
  });
};

export const trackScheduleVisit = (propertyId: string) => {
  event({
    action: 'schedule_visit',
    category: 'Property',
    label: propertyId,
  });
};

export const trackSearch = (filters: Record<string, unknown>) => {
  event({
    action: 'search',
    category: 'Properties',
    label: JSON.stringify(filters),
  });
};

export const trackFormSubmission = (formName: string) => {
  event({
    action: 'form_submit',
    category: 'Form',
    label: formName,
  });
};

export const trackButtonClick = (buttonName: string, location: string) => {
  event({
    action: 'button_click',
    category: 'Engagement',
    label: `${buttonName} - ${location}`,
  });
};
