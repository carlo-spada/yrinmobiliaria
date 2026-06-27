import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string;

/**
 * Cliente anónimo de solo lectura para Server Components, `generateMetadata`,
 * `sitemap.ts` y `robots.ts`. No usa cookies (no fuerza render dinámico) y solo
 * accede a datos legibles por el rol `anon` según las políticas RLS.
 */
export function getPublicSupabase() {
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
