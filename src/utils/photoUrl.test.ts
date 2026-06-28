import { describe, it, expect } from 'vitest';

import { isUsablePhotoUrl } from './photoUrl';

describe('isUsablePhotoUrl', () => {
  it('rejects empty / nullish values', () => {
    expect(isUsablePhotoUrl(null)).toBe(false);
    expect(isUsablePhotoUrl(undefined)).toBe(false);
    expect(isUsablePhotoUrl('')).toBe(false);
    expect(isUsablePhotoUrl('   ')).toBe(false);
  });

  it('rejects blob: URLs (the bug that left profile photos broken)', () => {
    expect(isUsablePhotoUrl('blob:https://yrinmobiliaria.com/15295dfb-ae24-479e-bfc0-5c0ce424cddd')).toBe(false);
  });

  it('rejects other non-https schemes and relative paths', () => {
    expect(isUsablePhotoUrl('data:image/png;base64,iVBORw0KGgo=')).toBe(false);
    expect(isUsablePhotoUrl('http://example.com/a.png')).toBe(false);
    expect(isUsablePhotoUrl('/local/a.png')).toBe(false);
    expect(isUsablePhotoUrl('javascript:alert(1)')).toBe(false);
  });

  it('accepts real https URLs (Supabase Storage object, remote avatars)', () => {
    expect(
      isUsablePhotoUrl(
        'https://ticsgpyathxawsupcghj.supabase.co/storage/v1/object/public/property-images/abc/def.webp'
      )
    ).toBe(true);
    expect(isUsablePhotoUrl('https://ui-avatars.com/api/?name=Carlo+Spada&format=png')).toBe(true);
  });

  it('trims surrounding whitespace before validating', () => {
    expect(isUsablePhotoUrl('  https://example.com/a.webp  ')).toBe(true);
  });
});
