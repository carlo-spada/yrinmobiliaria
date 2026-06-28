import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/integrations/supabase/types';
import { env } from '@/lib/env';

/**
 * Cliente anónimo de solo lectura para Server Components, `generateMetadata`,
 * `sitemap.ts` y `robots.ts`. No usa cookies (no fuerza render dinámico) y solo
 * accede a datos legibles por el rol `anon` según las políticas RLS.
 */
export function getPublicSupabase() {
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
