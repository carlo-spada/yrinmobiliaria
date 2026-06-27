// Cliente Supabase para el navegador (App Router / Next.js).
// Usa @supabase/ssr para almacenar la sesión en cookies y así compartirla con el
// servidor (middleware + Server Components). Reemplaza al antiguo createClient con
// localStorage del SPA de Vite.
import { createBrowserClient } from '@supabase/ssr';

import type { Database } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
export const supabase = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
