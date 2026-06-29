'use client';

import Image from 'next/image';
import * as React from 'react';

import { env } from '@/lib/env';
import { cn } from '@/lib/utils';
import { isUsablePhotoUrl } from '@/utils/photoUrl';

// Prefijo de los objetos públicos de NUESTRO Storage. Solo estas URLs van por
// `next/image` — coincide con `remotePatterns` en next.config.ts (ese host +
// `/storage/v1/object/public/**`). `next/image` LANZA con un host no
// whitelisteado, así que cualquier otra URL usa <img> normal (sin optimizar pero
// sin romper); por eso AdminUsers se mantuvo en <img> en su día.
const STORAGE_PUBLIC_PREFIX = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`;

export type AvatarRenderMode = 'optimized' | 'raw' | 'fallback';

/**
 * Decide cómo renderizar una `photo_url` de avatar:
 *   - `optimized`: objeto de nuestro Storage → `next/image` (resize + AVIF/WebP).
 *   - `raw`: otra URL https (host arbitrario / datos heredados) → <img> normal,
 *     porque `next/image` lanzaría con un host fuera de `remotePatterns`.
 *   - `fallback`: sin URL usable (`blob:`/`data:`/http/relativa/vacía) → iniciales.
 *
 * El prefijo de Storage se comprueba ANTES que `isUsablePhotoUrl` para que sea
 * la fuente de verdad de "esto es nuestro y next/image lo acepta".
 */
export function avatarRenderMode(src: string | null | undefined): AvatarRenderMode {
  const s = src?.trim();
  if (!s) return 'fallback';
  const clean = s.split('?')[0];
  if (clean.startsWith(STORAGE_PUBLIC_PREFIX)) return 'optimized';
  if (isUsablePhotoUrl(s)) return 'raw';
  return 'fallback';
}

interface OptimizedAvatarProps {
  src?: string | null;
  alt: string;
  /** Lado renderizado en px (cuadrado). Informa `sizes` a `next/image`. */
  sizePx: number;
  /** Contenido del fallback (iniciales o ícono) cuando no hay foto usable. */
  fallback: React.ReactNode;
  /** Clases de la raíz (tamaño `h-`/`w-`, `ring`, etc.). */
  className?: string;
  /** Clases del contenedor del fallback (color de texto/fondo). */
  fallbackClassName?: string;
}

/**
 * Avatar que sirve la foto OPTIMIZADA vía `next/image` (resize a `sizePx` +
 * AVIF/WebP + caché del optimizador) en lugar del <img> crudo de Radix Avatar,
 * que descarga el archivo completo (p. ej. un PNG de 2.4 MB) para un avatar de
 * 40–160 px. Degrada con elegancia igual que Radix Avatar (ver `avatarRenderMode`).
 */
export function OptimizedAvatar({
  src,
  alt,
  sizePx,
  fallback,
  className,
  fallbackClassName,
}: OptimizedAvatarProps) {
  const [errored, setErrored] = React.useState(false);
  React.useEffect(() => setErrored(false), [src]);

  const rootClass = cn(
    'relative flex shrink-0 overflow-hidden rounded-full bg-muted',
    className
  );
  const mode = errored ? 'fallback' : avatarRenderMode(src);

  if (mode === 'optimized') {
    return (
      <span className={rootClass}>
        <Image
          src={src!.split('?')[0]}
          alt={alt}
          fill
          sizes={`${sizePx}px`}
          className="object-cover"
          onError={() => setErrored(true)}
        />
      </span>
    );
  }

  if (mode === 'raw') {
    return (
      <span className={rootClass}>
        {/* Host arbitrario: next/image lanzaría; <img> degrada al fallback en error. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src!}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setErrored(true)}
        />
      </span>
    );
  }

  return (
    <span className={rootClass}>
      <span className={cn('flex h-full w-full items-center justify-center', fallbackClassName)}>
        {fallback}
      </span>
    </span>
  );
}
