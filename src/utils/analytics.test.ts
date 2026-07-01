import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import {
  GA_CONFIGURED,
  initGA,
  readConsent,
  storeConsent,
  updateConsent,
} from '@/utils/analytics';

beforeEach(() => {
  window.localStorage.clear();
  delete window.gtag;
  delete window.dataLayer;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('GA_CONFIGURED', () => {
  it('es false sin NEXT_PUBLIC_GA_MEASUREMENT_ID (entorno de test)', () => {
    expect(GA_CONFIGURED).toBe(false);
  });
});

describe('readConsent / storeConsent', () => {
  it('devuelve null si no hay decisión', () => {
    expect(readConsent()).toBeNull();
  });

  it('round-trip granted/denied', () => {
    storeConsent('granted');
    expect(readConsent()).toBe('granted');
    storeConsent('denied');
    expect(readConsent()).toBe('denied');
  });

  it('devuelve null ante un valor corrupto', () => {
    window.localStorage.setItem('cookie_consent', 'banana');
    expect(readConsent()).toBeNull();
  });
});

describe('updateConsent', () => {
  it('persiste y emite el consent update a gtag (granted)', () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    updateConsent(true);
    expect(readConsent()).toBe('granted');
    expect(gtag).toHaveBeenCalledWith('consent', 'update', { analytics_storage: 'granted' });
  });

  it('persiste denied y lo refleja en gtag', () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    updateConsent(false);
    expect(readConsent()).toBe('denied');
    expect(gtag).toHaveBeenCalledWith('consent', 'update', { analytics_storage: 'denied' });
  });

  it('no lanza si gtag aún no existe (solo persiste)', () => {
    expect(() => updateConsent(true)).not.toThrow();
    expect(readConsent()).toBe('granted');
  });
});

describe('initGA sin configurar', () => {
  it('es no-op: no crea gtag ni carga el script', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    const before = document.querySelectorAll('script[src*="googletagmanager"]').length;
    initGA();
    expect(window.gtag).toBeUndefined();
    expect(document.querySelectorAll('script[src*="googletagmanager"]').length).toBe(before);
    expect(info).toHaveBeenCalled();
  });
});
