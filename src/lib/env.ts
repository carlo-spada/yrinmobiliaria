import { z } from 'zod';

/**
 * Esquema del entorno público (`NEXT_PUBLIC_*`).
 *
 * Next.js inyecta estas variables en el bundle de cliente en tiempo de build, por
 * lo que cada una DEBE referenciarse de forma estática (ver `rawClientEnv`); un
 * acceso dinámico tipo `process.env[clave]` no se reemplaza y llegaría vacío al
 * navegador. Validar aquí nos da una única fuente tipada y un fallo claro en boot
 * si algo está mal configurado, en lugar del error críptico de
 * `@supabase/supabase-js` ("supabaseUrl is required").
 */
export const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('NEXT_PUBLIC_SUPABASE_URL debe ser una URL válida (https://xxxx.supabase.co)'),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY es obligatoria'),
  NEXT_PUBLIC_SUPABASE_PROJECT_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url('NEXT_PUBLIC_SITE_URL debe ser una URL válida')
    .default('https://yrinmobiliaria.com'),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().optional(),
  // Site key pública de Cloudflare Turnstile (anti-abuso en formularios). Opcional:
  // si no está, el widget no se renderiza y los formularios siguen funcionando.
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

// Referencias estáticas: Next solo reemplaza accesos literales a
// `process.env.NEXT_PUBLIC_*`, así que las enumeramos una por una.
const rawClientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SUPABASE_PROJECT_ID: process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
};

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join('.');
      // Anteponer la variable: ante un valor `undefined` zod emite un mensaje
      // genérico ("expected string, received undefined") que sin el path no
      // diría QUÉ variable falta.
      return path ? `  • ${path}: ${issue.message}` : `  • ${issue.message}`;
    })
    .join('\n');
}

/**
 * Validación no-lanzante, para chequeos en UI o runtime. Por defecto valida el
 * entorno real; acepta un objeto explícito para tests.
 */
export function validateClientEnv(
  raw: Record<string, string | undefined> = rawClientEnv,
): { isValid: boolean; error?: string } {
  const result = clientEnvSchema.safeParse(raw);
  return result.success ? { isValid: true } : { isValid: false, error: formatIssues(result.error) };
}

function loadClientEnv(): ClientEnv {
  const result = clientEnvSchema.safeParse(rawClientEnv);
  if (!result.success) {
    throw new Error(
      `❌ Variables de entorno públicas inválidas:\n${formatIssues(result.error)}\n` +
        'Revisa tu archivo .env contra .env.example.',
    );
  }
  return result.data;
}

/**
 * Entorno público validado y tipado. Se valida una vez al importar el módulo
 * (fail-fast en boot). En producción las variables siempre están definidas en
 * Vercel, así que esto solo dispara ante una mala configuración real.
 */
export const env: ClientEnv = loadClientEnv();
