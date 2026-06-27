import { Json } from '@/integrations/supabase/types';

const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'api_key',
  'apiKey',
  'credential',
  'auth',
  'session',
  'cookie',
  'private_key',
  'privateKey',
] as const;

const REDACTED_VALUE = '[REDACTED]';

const shouldRedact = (key: string) => {
  const normalizedKey = key.toLowerCase();
  return SENSITIVE_FIELDS.some((field) => normalizedKey.includes(field.toLowerCase()));
};

const redactAuditValue = (value: Json): Json => {
  if (Array.isArray(value)) {
    return value.map((entry) => redactAuditValue(entry)) as Json;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, Json>).map(([key, entryValue]) => [
      key,
      shouldRedact(key) ? REDACTED_VALUE : redactAuditValue(entryValue),
    ]);

    return Object.fromEntries(entries) as Json;
  }

  return value;
};

export const sanitizeChanges = (changes: Json): string => {
  if (!changes) return '-';
  return JSON.stringify(redactAuditValue(changes), null, 2);
};
