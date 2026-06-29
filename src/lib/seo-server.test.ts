import { describe, it, expect } from 'vitest';

import {
  buildLocalBusinessLd,
  buildOrganizationLd,
  parseAddress,
  toE164,
  type SiteSettingsMap,
} from '@/lib/seo-server';

// Réplica del site_settings real (lectura pública) que alimenta el JSON-LD.
const LIVE_SETTINGS: SiteSettingsMap = {
  company_name: 'YR Inmobiliaria',
  company_address: 'Calle Independencia 12345, Centro Histórico, Oaxaca de Juárez, Oaxaca, México',
  company_email: 'contacto@yrinmobiliaria.com',
  company_phone: '(951) 610 6031',
  whatsapp_number: '529516106031',
  facebook_url: 'https://www.facebook.com/yas.ruiz.vasquez.2025',
  instagram_url: 'https://www.instagram.com/yasr_ux/',
  business_hours: 'Lunes a Viernes: 9:00 AM - 6:00 PM',
};

// Placeholders falsos que vivían quemados en el código antes de 5.3 — no deben
// volver a aparecer en ninguna salida.
const FAKE_PLACEHOLDERS = [
  '+52-951-123-4567',
  'facebook.com/yrinmobiliaria',
  'instagram.com/yrinmobiliaria',
];

describe('toE164', () => {
  it('prefiere whatsapp_number (ya trae código de país) sobre company_phone', () => {
    expect(toE164('529516106031', '(951) 610 6031')).toBe('+529516106031');
  });

  it('cae al siguiente candidato si el primero no tiene dígitos', () => {
    expect(toE164(undefined, '(951) 610 6031')).toBe('+9516106031');
  });

  it('quita todo lo que no sea dígito', () => {
    expect(toE164('+52 (951) 610-6031')).toBe('+529516106031');
  });

  it('devuelve null si no hay dígitos en ningún candidato', () => {
    expect(toE164(undefined, '', 'sin-numero')).toBeNull();
  });
});

describe('parseAddress', () => {
  it('parte el formato de 5 partes en campos de PostalAddress', () => {
    expect(parseAddress(LIVE_SETTINGS.company_address)).toEqual({
      streetAddress: 'Calle Independencia 12345, Centro Histórico',
      addressLocality: 'Oaxaca de Juárez',
      addressRegion: 'Oaxaca',
      addressCountry: 'MX',
    });
  });

  it('normaliza el país (México/Mexico/MX) a código ISO MX', () => {
    expect(parseAddress('Calle 1, Col, Ciudad, Estado, Mexico')?.addressCountry).toBe('MX');
    expect(parseAddress('Calle 1, Col, Ciudad, Estado, MX')?.addressCountry).toBe('MX');
  });

  it('cae a streetAddress completo + ubicación constante si no hay 5 partes', () => {
    expect(parseAddress('Av. Reforma 100, Oaxaca')).toEqual({
      streetAddress: 'Av. Reforma 100, Oaxaca',
      addressLocality: 'Oaxaca de Juárez',
      addressRegion: 'Oaxaca',
      addressCountry: 'MX',
    });
  });

  it('devuelve null para vacío/null/undefined', () => {
    expect(parseAddress('')).toBeNull();
    expect(parseAddress('   ')).toBeNull();
    expect(parseAddress(null)).toBeNull();
    expect(parseAddress(undefined)).toBeNull();
  });
});

describe('buildOrganizationLd', () => {
  it('usa la NAP/redes reales de site_settings', () => {
    const ld = buildOrganizationLd('es', LIVE_SETTINGS);
    expect(ld['@type']).toBe('Organization');
    expect(ld.name).toBe('YR Inmobiliaria');
    expect(ld.contactPoint).toMatchObject({
      telephone: '+529516106031',
      email: 'contacto@yrinmobiliaria.com',
    });
    expect(ld.sameAs).toEqual([
      'https://www.facebook.com/yas.ruiz.vasquez.2025',
      'https://www.instagram.com/yasr_ux/',
    ]);
  });

  it('no emite placeholders falsos', () => {
    const json = JSON.stringify(buildOrganizationLd('es', LIVE_SETTINGS));
    for (const fake of FAKE_PLACEHOLDERS) expect(json).not.toContain(fake);
  });

  it('filtra sameAs no-http (no inventa redes)', () => {
    const ld = buildOrganizationLd('es', { facebook_url: 'not-a-url', instagram_url: '' });
    expect(ld.sameAs).toBeUndefined();
  });

  it('sin settings: omite contactPoint y sameAs, name cae al canónico', () => {
    const ld = buildOrganizationLd('es', {});
    expect(ld.name).toBe('YR Inmobiliaria');
    expect(ld.contactPoint).toBeUndefined();
    expect(ld.sameAs).toBeUndefined();
    // Y nunca un teléfono/red falso:
    const json = JSON.stringify(ld);
    for (const fake of FAKE_PLACEHOLDERS) expect(json).not.toContain(fake);
  });

  it('respeta el idioma en la descripción', () => {
    expect(String(buildOrganizationLd('en', {}).description)).toContain('Real estate experts');
    expect(String(buildOrganizationLd('es', {}).description)).toContain('bienes raíces');
  });
});

describe('buildLocalBusinessLd', () => {
  it('es RealEstateAgent con dirección parseada + teléfono/email reales', () => {
    const ld = buildLocalBusinessLd('es', LIVE_SETTINGS);
    expect(ld['@type']).toBe('RealEstateAgent');
    expect(ld.telephone).toBe('+529516106031');
    expect(ld.email).toBe('contacto@yrinmobiliaria.com');
    expect(ld.address).toMatchObject({
      '@type': 'PostalAddress',
      streetAddress: 'Calle Independencia 12345, Centro Histórico',
      addressLocality: 'Oaxaca de Juárez',
      addressCountry: 'MX',
    });
    expect(ld.openingHours).toEqual(['Mo-Fr 09:00-18:00', 'Sa-Su 10:00-16:00']);
  });

  it('sin settings: conserva geo/openingHours/priceRange pero omite address/telephone/email', () => {
    const ld = buildLocalBusinessLd('es', {});
    expect(ld.address).toBeUndefined();
    expect(ld.telephone).toBeUndefined();
    expect(ld.email).toBeUndefined();
    expect(ld.geo).toBeDefined();
    expect(ld.priceRange).toBe('$$');
  });
});
