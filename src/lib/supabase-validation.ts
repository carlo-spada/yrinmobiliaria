import { validateClientEnv } from './env';

/**
 * @deprecated Usa `validateClientEnv` de `@/lib/env`, que valida todas las
 * variables `NEXT_PUBLIC_*`. Se mantiene por compatibilidad con
 * `@/utils/supabaseValidation`.
 *
 * Valida que las variables de Supabase estén presentes.
 * @returns `{ isValid, error? }`
 */
export function validateSupabaseEnv(): { isValid: boolean; error?: string } {
  return validateClientEnv();
}
