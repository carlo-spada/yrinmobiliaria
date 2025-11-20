import { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ImageVariants = {
  avif: Record<number, string>;
  webp: Record<number, string>;
};

interface ResponsiveImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'loading'> {
  src?: string; // legacy single source
  variants?: ImageVariants; // preferred: generated variants
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

/**
 * ResponsiveImage component for optimized image loading
 * - Automatically applies loading="eager" for priority images (LCP optimization)
 * - Uses loading="lazy" for non-priority images
 * - Supports custom sizes for responsive images
 * - Handles Supabase Storage URLs (framework for future transformation API)
 */
export function ResponsiveImage({
  src,
  variants,
  alt,
  priority = false,
  sizes,
  className,
  ...props
}: ResponsiveImageProps) {
  // If variants are provided, prefer them (AVIF first, then WebP)
  if (variants) {
    const buildSrcSet = (record?: Record<number, string>) =>
      record
        ? Object.entries(record)
            .map(([w, url]) => `${url} ${w}w`)
            .join(', ')
        : undefined;

    const avifSrcSet = buildSrcSet(variants.avif);
    const webpSrcSet = buildSrcSet(variants.webp);

    // Fallback src: pick the largest WebP if available, otherwise AVIF
    const fallbackSrc =
      variants.webp?.[Math.max(...Object.keys(variants.webp).map(Number))] ||
      variants.avif?.[Math.max(...Object.keys(variants.avif).map(Number))] ||
      '';

    const defaultSizes =
      sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

    return (
      <picture>
        {avifSrcSet && <source type="image/avif" srcSet={avifSrcSet} sizes={defaultSizes} />}
        {webpSrcSet && <source type="image/webp" srcSet={webpSrcSet} sizes={defaultSizes} />}
        <img
          src={fallbackSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          className={cn('transition-opacity duration-300', className)}
          sizes={defaultSizes}
          {...props}
        />
      </picture>
    );
  }

  // Default sizes for property images
  const defaultSizes = sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  
  // Check if image is from Supabase Storage
  const isSupabase = src ? src.includes('supabase.co/storage') : false;
  
  /**
   * Generate Supabase image transformation srcSet
   * - Preserves existing query params (e.g., signed URLs)
   * - Multiple widths: 480, 768, 1080, 1440
   * - WebP format for better compression
   * - Quality: 75 for optimal balance
   * - Uses resize=cover with calculated height for proper aspect ratio
   * - Assumes 4:3 aspect ratio for property images (standard for listings)
   */
  const generateSupabaseSrcset = (url: string): string => {
    if (!isSupabase) return '';
    
    const widths = [480, 768, 1080, 1440];
    const aspectRatio = 4 / 3; // Standard property image aspect ratio
    
    const srcsetParts = widths.map(width => {
      const height = Math.round(width / aspectRatio);
      const supabaseUrl = new URL(url);
      
      // Preserve existing query params by only setting/overwriting transform params
      supabaseUrl.searchParams.set('width', width.toString());
      supabaseUrl.searchParams.set('height', height.toString());
      supabaseUrl.searchParams.set('format', 'webp');
      supabaseUrl.searchParams.set('quality', '75');
      supabaseUrl.searchParams.set('resize', 'cover');
      
      return `${supabaseUrl.toString()} ${width}w`;
    });
    
    return srcsetParts.join(', ');
  };
  
  const srcset = isSupabase ? generateSupabaseSrcset(src) : undefined;

  // If no src provided, render nothing (caller error guard)
  if (!src) {
    return null;
  }

  return (
    <img
      src={src}
      srcSet={srcset}
      sizes={defaultSizes}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={cn('transition-opacity duration-300', className)}
      {...props}
    />
  );
}
