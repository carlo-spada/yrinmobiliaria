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
  // Hay otros package-lock.json en directorios padre (worktree + checkout principal);
  // fijamos el root para que Next no infiera mal la ubicación de `app/`.
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
  // Phase 4.4: las imágenes se sirven vía `next/image` (optimizador de Next/Vercel).
  // La transformación de imágenes de Supabase está deshabilitada en este plan
  // (endpoint `/render/image` → 403), así que el optimizador de Next hace el
  // resize/recompresión real a partir del objeto público. `remotePatterns` se
  // acota al host de Supabase + el bucket público (se retira el wildcard
  // `*.supabase.co`) y a Unsplash (imágenes de fallback de zonas / about).
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHost,
        pathname: '/storage/v1/object/public/**',
      },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    qualities: [75],
    // Las imágenes de propiedad/zona son inmutables (ruta de storage única por
    // subida; el contenido nunca cambia in-place), así que cacheamos las
    // transformaciones del optimizador 31 días para acotar costo/egress.
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
};

export default nextConfig;
