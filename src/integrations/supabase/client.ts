// Cliente Supabase para el navegador (App Router / Next.js).
// Usa @supabase/ssr para almacenar la sesión en cookies y así compartirla con el
// servidor (middleware + Server Components). Reemplaza al antiguo createClient con
// localStorage del SPA de Vite.
import { createBrowserClient } from '@supabase/ssr';

import { env } from '@/lib/env';

import type { Database } from './types';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
export const supabase = createBrowserClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
