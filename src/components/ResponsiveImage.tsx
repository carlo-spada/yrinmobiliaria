import { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'loading'> {
  src: string;
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
  alt,
  priority = false,
  sizes,
  className,
  ...props
}: ResponsiveImageProps) {
  // Default sizes for property images
  const defaultSizes = sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  
  // Check if image is from Supabase Storage
  const isSupabase = src.includes('supabase.co/storage');
  
  // Framework for future Supabase image transformation
  // When implemented, this will generate multiple sizes using Supabase's transformation API
  // Example: src?width=640, src?width=1024, src?width=1920
  const generateSupabaseSrcset = (url: string): string => {
    // Future implementation: Use Supabase image transformation
    // For now, return the original URL
    // TODO: Implement when Supabase transformation is configured
    return url;
  };
  
  const srcset = isSupabase ? generateSupabaseSrcset(src) : undefined;

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
