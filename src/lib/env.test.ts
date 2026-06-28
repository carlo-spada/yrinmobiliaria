import { describe, expect, it } from 'vitest';

import { clientEnvSchema, validateClientEnv } from './env';

const valid = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://abc.supabase.co',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'anon-key',
};

describe('clientEnvSchema', () => {
  it('accepts a minimal valid config and applies the SITE_URL default', () => {
    const result = clientEnvSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NEXT_PUBLIC_SITE_URL).toBe('https://yrinmobiliaria.com');
    }
  });

  it('keeps an explicit SITE_URL over the default', () => {
    const result = clientEnvSchema.safeParse({
      ...valid,
      NEXT_PUBLIC_SITE_URL: 'https://staging.example.com',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NEXT_PUBLIC_SITE_URL).toBe('https://staging.example.com');
    }
  });

  it('accepts optional analytics and whatsapp when present', () => {
    const result = clientEnvSchema.safeParse({
      ...valid,
      NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-XXXXXXX',
      NEXT_PUBLIC_WHATSAPP_NUMBER: '5219511234567',
    });
    expect(result.success).toBe(true);
  });
});

describe('validateClientEnv', () => {
  it('reports a missing Supabase URL', () => {
    const { isValid, error } = validateClientEnv({
      ...valid,
      NEXT_PUBLIC_SUPABASE_URL: undefined,
    });
    expect(isValid).toBe(false);
    expect(error).toMatch(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it('reports a non-URL Supabase URL', () => {
    const { isValid, error } = validateClientEnv({
      ...valid,
      NEXT_PUBLIC_SUPABASE_URL: 'not-a-url',
    });
    expect(isValid).toBe(false);
    expect(error).toMatch(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it('reports an empty publishable key', () => {
    const { isValid, error } = validateClientEnv({
      ...valid,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: '',
    });
    expect(isValid).toBe(false);
    expect(error).toMatch(/PUBLISHABLE_KEY/);
  });

  it('passes for a fully valid environment', () => {
    expect(validateClientEnv(valid)).toEqual({ isValid: true });
  });
});
