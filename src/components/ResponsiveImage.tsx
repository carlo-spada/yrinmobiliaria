'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

type ImageVariants = {
  avif: Record<number, string>;
  webp: Record<number, string>;
};

interface ResponsiveImageProps {
  src?: string;
  /**
   * @deprecated Phase 4.4 — el optimizador de `next/image` genera el set
   * responsive (AVIF/WebP) directamente desde `src`, así que las variantes
   * pre-generadas ya no se usan. Se mantiene en la API para no tocar los ~11
   * call sites que aún lo pasan; se ignora.
   */
  variants?: ImageVariants;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  /**
   * `true` (default): la imagen LLENA el contenedor padre (object-cover). El
   * padre DEBE estar posicionado (relative/absolute) y tener tamaño (aspect-* o
   * alto fijo). `false`: tamaño intrínseco con `width`/`height` (p.ej. el
   * lightbox del detalle, object-contain + h-auto).
   */
  fill?: boolean;
  width?: number;
  height?: number;
  quality?: number;
}

const DEFAULT_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

/**
 * Quita los parámetros de transform de las URLs de Supabase Storage. En este
 * proyecto el endpoint `/render/image` (transform) está deshabilitado (403), así
 * que esos params (`?width=…&format=…`) son no-op sobre `/object/public`; al
 * removerlos, `next/image` cachea el origen por una URL limpia y estable.
 */
function cleanSrc(src: string): string {
  if (src.includes('.supabase.co/storage/')) {
    const q = src.indexOf('?');
    return q === -1 ? src : src.slice(0, q);
  }
  return src;
}

/**
 * Imagen optimizada vía `next/image` (optimizador de Next/Vercel: resize
 * responsive + AVIF/WebP + lazy + sin CLS). Modo `fill` por defecto (cubre un
 * contenedor con tamaño definido); `fill={false}` para tamaño intrínseco.
 * Soporta URLs de Supabase Storage y Unsplash (ver `remotePatterns`).
 */
export function ResponsiveImage({
  src,
  alt,
  priority = false,
  sizes,
  className,
  fill = true,
  width,
  height,
  quality = 75,
}: ResponsiveImageProps) {
  if (!src) return null;

  const common = {
    src: cleanSrc(src),
    alt,
    priority,
    quality,
    className: cn('transition-opacity duration-300', className),
  };

  if (fill) {
    return <Image {...common} fill sizes={sizes || DEFAULT_SIZES} />;
  }

  return (
    <Image
      {...common}
      width={width ?? 1600}
      height={height ?? 1200}
      sizes={sizes || '100vw'}
      style={{ width: '100%', height: 'auto' }}
    />
  );
}
