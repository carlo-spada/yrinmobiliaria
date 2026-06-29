import { describe, it, expect } from 'vitest';

import { env } from '@/lib/env';

import { avatarRenderMode } from './OptimizedAvatar';

const STORAGE_URL = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-images/u1/photo.png`;

describe('avatarRenderMode', () => {
  it('optimiza las fotos de NUESTRO Storage (next/image)', () => {
    expect(avatarRenderMode(STORAGE_URL)).toBe('optimized');
    // ignora el querystring al clasificar
    expect(avatarRenderMode(`${STORAGE_URL}?width=100`)).toBe('optimized');
  });

  it('usa <img> normal (raw) para hosts arbitrarios — NUNCA next/image (lanzaría)', () => {
    expect(avatarRenderMode('https://example.com/avatar.jpg')).toBe('raw');
    expect(avatarRenderMode('https://ui-avatars.com/api/?name=Yas')).toBe('raw');
  });

  it('cae al fallback para URLs no usables (blob/data/http/relativa/vacía)', () => {
    expect(avatarRenderMode('blob:http://localhost/abc')).toBe('fallback');
    expect(avatarRenderMode('data:image/png;base64,iVBOR')).toBe('fallback');
    expect(avatarRenderMode('http://insecure.com/a.png')).toBe('fallback');
    expect(avatarRenderMode('/local/relative.png')).toBe('fallback');
    expect(avatarRenderMode('')).toBe('fallback');
    expect(avatarRenderMode('   ')).toBe('fallback');
    expect(avatarRenderMode(null)).toBe('fallback');
    expect(avatarRenderMode(undefined)).toBe('fallback');
  });
});
