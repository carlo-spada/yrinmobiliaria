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
  
  /**
   * Generate Supabase image transformation srcSet
   * Uses Supabase's image transformation API for optimal performance
   * - Multiple widths: 480, 768, 1080, 1440
   * - WebP format for better compression
   * - Quality: 75 for optimal file size/quality balance
   * - Resize mode: cover for consistent aspect ratios
   */
  const generateSupabaseSrcset = (url: string): string => {
    if (!isSupabase) return '';
    
    const widths = [480, 768, 1080, 1440];
    const baseUrl = url.split('?')[0]; // Remove existing query params
    
    const srcsetParts = widths.map(width => {
      const params = new URLSearchParams({
        width: width.toString(),
        format: 'webp',
        quality: '75',
        resize: 'cover'
      });
      return `${baseUrl}?${params.toString()} ${width}w`;
    });
    
    return srcsetParts.join(', ');
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
