# Image Optimization System

## Overview

This project implements a comprehensive image optimization system using Supabase Image Transformation API and automatic variant generation for all property images.

## Architecture

### 1. Database Structure

**Properties Table**
- Added `image_variants` JSONB column containing an array of optimized image variants
- Structure: `[{id, variants: {avif: {480: url, 768: url, 1280: url, 1920: url}, webp: {...}}, alt_es, alt_en, order}]`

### 2. Upload Flow

**Client Upload → Edge Function → Variants Generation**

1. Admin uploads image via `ImageUploadZone`
2. Image is optimized to WebP and uploaded to Supabase Storage
3. Edge function `optimize-property-image` is called automatically
4. Edge function generates transformation URLs for multiple breakpoints:
   - **480px** (Mobile small) - Target: ≤40 KB
   - **768px** (Mobile/Tablet) - Target: ≤80 KB
   - **1280px** (Desktop) - Target: ≤150 KB
   - **1920px** (Large desktop) - Target: reasonable for gallery
5. Both AVIF (75% quality) and WebP (80% quality) variants are generated
6. Variants are stored in `image_variants` column

### 3. Rendering Flow

**ResponsiveImage Component**

The `ResponsiveImage` component handles three cases:

1. **New images with variants** (preferred)
   - Uses `<picture>` element with AVIF/WebP sources
   - Browser automatically selects best format and size
   - Optimal performance and format support

2. **Legacy images without variants** (fallback)
   - Uses Supabase transform parameters on-the-fly
   - Generates srcset with multiple widths
   - Transforms applied at request time

3. **Static assets** (e.g., hero images)
   - Pre-optimized files in `/public`
   - Direct serving, no transformation

## Benefits

### Performance
- **75% reduction** in image file sizes (AVIF vs JPEG)
- **Automatic format selection** - browsers choose AVIF > WebP > fallback
- **Responsive loading** - correct size for viewport
- **LCP improvement** - priority images load eagerly

### Security
- **EXIF stripping** planned (remove GPS, device data)
- Storage in dedicated bucket with proper RLS

### Developer Experience
- **Automatic optimization** - no manual image processing
- **Backward compatible** - legacy images still work
- **Consistent API** - same component for all images

## Usage

### For New Properties

```typescript
// Admin uploads image
const result = await uploadImage(file, propertyId);
// result includes: { url, path, variants }

// Variants automatically saved to image_variants column
```

### For Display

```typescript
// PropertyCard, FeaturedProperties, etc.
<PropertyCard
  id={property.id}
  image={property.images[0]}
  variants={property.imageVariants?.[0]?.variants} // Use variants if available
  alt={...}
  {...otherProps}
/>

// ResponsiveImage handles format selection
<ResponsiveImage
  src={image}
  variants={variants} // Optional - uses transform fallback if not provided
  alt={alt}
  priority={isAboveFold}
/>
```

## File Locations

### Backend
- `/supabase/functions/optimize-property-image/` - Variant generation edge function
- `/src/utils/imageUpload.ts` - Upload utility with optimization

### Frontend
- `/src/components/ResponsiveImage.tsx` - Smart image component
- `/src/components/PropertyCard.tsx` - Card component with variants support
- `/src/hooks/useProperties.ts` - Fetches imageVariants from DB

### Admin
- `/src/components/admin/ImageUploadZone.tsx` - Upload interface
- `/src/components/admin/PropertyFormDialog.tsx` - Saves variants to DB

## Optimization Targets

### Breakpoints
- **Mobile (480px)**: ≤40 KB per image
- **Tablet (768px)**: ≤80 KB per image
- **Desktop (1280px)**: ≤150 KB per image
- **Large (1920px)**: Used for gallery/lightbox

### Format Quality
- **AVIF**: 75% quality (superior compression)
- **WebP**: 80% quality (wider support)

### Aspect Ratios
- **Property cards**: 4:3 (standard listing ratio)
- **Hero images**: 16:9 (optimized separately)

## Browser Support

- **AVIF**: Chrome 85+, Edge 121+, Firefox 93+, Safari 16+ (>90% coverage)
- **WebP**: Chrome 23+, Edge 18+, Firefox 65+, Safari 14+ (>95% coverage)
- **Fallback**: Original or transform-generated WebP for older browsers

## Future Enhancements

### Planned
1. **EXIF stripping** - Remove GPS and device metadata on upload
2. **HEIC support** - Accept Apple photos directly
3. **Background processing** - Queue variant generation for faster uploads
4. **Admin regeneration** - Bulk regenerate variants for existing properties

### Considerations
- **CDN caching** - Leverage edge caching for transforms
- **Lazy loading** - Intersection Observer for below-fold images
- **Blur placeholders** - LQIP (Low Quality Image Placeholder) generation

## Monitoring

### Metrics to Track
- Average image size by breakpoint
- AVIF vs WebP usage rate
- Transform cache hit rate
- LCP scores across pages

### Debugging
```javascript
// Check if variants exist
console.log('Variants:', property.imageVariants);

// Check if AVIF is being used
// In DevTools Network tab, filter by image type

// Verify Supabase transforms
// Look for query params: ?width=480&format=avif&quality=75
```

## Troubleshooting

### Images not loading
- Check RLS policies on `property-images` bucket
- Verify edge function deployed successfully
- Check browser console for CORS errors

### Variants not generated
- Check edge function logs in Lovable Cloud
- Verify image was uploaded with propertyId
- Check `image_variants` column in database

### Transform fallback issues
- Ensure Supabase project has Image Transformation enabled
- Verify public access to storage bucket
- Check URL format includes proper transform params

## Related Documentation

- [Supabase Image Transformation](https://supabase.com/docs/guides/storage/image-transformations)
- [AVIF Format Specification](https://aomediacodec.github.io/av1-avif/)
- [Responsive Images (MDN)](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
