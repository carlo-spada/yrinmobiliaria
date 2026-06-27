import type { NextConfig } from 'next';
import { dirname } from 'path';
import { fileURLToPath } from 'url';


const projectRoot = dirname(fileURLToPath(import.meta.url));

const supabaseHost = (() => {
  try {
    return new URL(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://ticsgpyathxawsupcghj.supabase.co'
    ).hostname;
  } catch {
    return 'ticsgpyathxawsupcghj.supabase.co';
  }
})();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // El build de Vite nunca hizo typecheck (esbuild descarta tipos y no había
  // script tsc), así que el repo arrastra errores de tipos latentes. Mantenemos
  // paridad: el typecheck queda como gate separado (`tsc`/lint), no bloquea el
  // build. TODO(PR3): limpiar tipos y reactivar.
  typescript: {
    ignoreBuildErrors: true,
  },
  // Hay otros package-lock.json en directorios padre (worktree + checkout principal);
  // fijamos el root para que Next no infiera mal la ubicación de `app/`.
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
  // El cuerpo de las páginas se hidrata en cliente (react-query + react-router-compat);
  // las imágenes de propiedades se sirven vía <img>/ResponsiveImage con las URLs de
  // transform de Supabase. next/image es un pulido opcional posterior (plan R8).
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: supabaseHost },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};

export default nextConfig;
