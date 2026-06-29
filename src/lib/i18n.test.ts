import { describe, it, expect } from 'vitest';

import {
  isPublicPath,
  localeFromPathname,
  localizedHref,
  stripLocale,
  withLocale,
} from '@/lib/i18n';

describe('isPublicPath', () => {
  it('reconoce home y rutas públicas', () => {
    for (const p of ['/', '/propiedades', '/propiedad/123', '/agentes', '/agentes/yas', '/blog', '/contacto']) {
      expect(isPublicPath(p)).toBe(true);
    }
  });
  it('rechaza rutas privadas', () => {
    for (const p of ['/admin', '/agent/dashboard', '/cuenta', '/auth', '/onboarding/x']) {
      expect(isPublicPath(p)).toBe(false);
    }
  });
});

describe('localeFromPathname', () => {
  it('detecta /en', () => {
    expect(localeFromPathname('/en')).toBe('en');
    expect(localeFromPathname('/en/propiedades')).toBe('en');
  });
  it('default es', () => {
    expect(localeFromPathname('/')).toBe('es');
    expect(localeFromPathname('/propiedades')).toBe('es');
    // No confundir un slug que empieza con "en"
    expect(localeFromPathname('/entrada')).toBe('es');
  });
});

describe('stripLocale', () => {
  it('quita /en', () => {
    expect(stripLocale('/en')).toBe('/');
    expect(stripLocale('/en/propiedades')).toBe('/propiedades');
    expect(stripLocale('/en/propiedad/123')).toBe('/propiedad/123');
  });
  it('deja igual lo no prefijado', () => {
    expect(stripLocale('/')).toBe('/');
    expect(stripLocale('/propiedades')).toBe('/propiedades');
    expect(stripLocale('/entrada')).toBe('/entrada');
  });
});

describe('withLocale', () => {
  it('es = canónico', () => {
    expect(withLocale('/propiedades', 'es')).toBe('/propiedades');
    expect(withLocale('/', 'es')).toBe('/');
  });
  it('en = prefijado', () => {
    expect(withLocale('/propiedades', 'en')).toBe('/en/propiedades');
    expect(withLocale('/', 'en')).toBe('/en');
  });
});

describe('localizedHref', () => {
  it('en: prefija rutas internas públicas', () => {
    expect(localizedHref('/propiedades', 'en')).toBe('/en/propiedades');
    expect(localizedHref('/propiedad/123', 'en')).toBe('/en/propiedad/123');
    expect(localizedHref('/', 'en')).toBe('/en');
  });
  it('es: nunca prefija (canónico)', () => {
    expect(localizedHref('/propiedades', 'es')).toBe('/propiedades');
    expect(localizedHref('/', 'es')).toBe('/');
  });
  it('en: no prefija rutas privadas', () => {
    expect(localizedHref('/admin', 'en')).toBe('/admin');
    expect(localizedHref('/agent/dashboard', 'en')).toBe('/agent/dashboard');
    expect(localizedHref('/cuenta', 'en')).toBe('/cuenta');
  });
  it('en: no duplica el prefijo', () => {
    expect(localizedHref('/en/propiedades', 'en')).toBe('/en/propiedades');
  });
  it('deja intactos externos/esquemas/anclas', () => {
    for (const lang of ['es', 'en'] as const) {
      expect(localizedHref('https://wa.me/123', lang)).toBe('https://wa.me/123');
      expect(localizedHref('mailto:a@b.com', lang)).toBe('mailto:a@b.com');
      expect(localizedHref('tel:+52', lang)).toBe('tel:+52');
      expect(localizedHref('//cdn.com/x', lang)).toBe('//cdn.com/x');
      expect(localizedHref('#section', lang)).toBe('#section');
      expect(localizedHref('', lang)).toBe('');
    }
  });
  it('conserva query y hash al prefijar', () => {
    expect(localizedHref('/propiedades?zona=centro#lista', 'en')).toBe('/en/propiedades?zona=centro#lista');
  });
});
