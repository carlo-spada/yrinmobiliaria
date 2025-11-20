# Hero Images Optimization Guide

## Required Hero Image Assets

To achieve mobile performance score 90+ with LCP <2.5s, generate the following optimized hero images:

### Mobile Images (Portrait Orientation)
**Target Size: ≤60 KB per image**

- `hero-mobile-480.avif` - 480×640px (AVIF format, quality 75-80)
- `hero-mobile-480.webp` - 480×640px (WebP format, quality 75-80)
- `hero-mobile-640.avif` - 640×853px (AVIF format, quality 75-80)
- `hero-mobile-640.webp` - 640×853px (WebP format, quality 75-80)

### Tablet Images (Landscape Orientation)
**Target Size: ≤120 KB per image**

- `hero-tablet-768.avif` - 768×576px (AVIF format, quality 75-80)
- `hero-tablet-768.webp` - 768×576px (WebP format, quality 75-80)
- `hero-tablet-1024.avif` - 1024×768px (AVIF format, quality 75-80)
- `hero-tablet-1024.webp` - 1024×768px (WebP format, quality 75-80)

### Desktop Images (Landscape Orientation)
**Target Size: ≤250 KB per image**

- `hero-desktop-1280.avif` - 1280×720px (AVIF format, quality 75-80)
- `hero-desktop-1280.webp` - 1280×720px (WebP format, quality 75-80)
- `hero-desktop-1920.avif` - 1920×1080px (AVIF format, quality 75-80)
- `hero-desktop-1920.webp` - 1920×1080px (WebP format, quality 75-80)

## Conversion Instructions

### Using ImageMagick (Command Line)

```bash
# Convert to AVIF
magick hero-mobile.webp -resize 480x640 -quality 80 hero-mobile-480.avif
magick hero-mobile.webp -resize 640x853 -quality 80 hero-mobile-640.avif

# Convert to WebP at different sizes
magick hero-mobile.webp -resize 480x640 -quality 80 hero-mobile-480.webp
magick hero-mobile.webp -resize 640x853 -quality 80 hero-mobile-640.webp

# Tablet
magick hero-tablet.webp -resize 768x576 -quality 80 hero-tablet-768.avif
magick hero-tablet.webp -resize 768x576 -quality 80 hero-tablet-768.webp
magick hero-tablet.webp -resize 1024x768 -quality 80 hero-tablet-1024.avif
magick hero-tablet.webp -resize 1024x768 -quality 80 hero-tablet-1024.webp

# Desktop
magick hero-desktop.webp -resize 1280x720 -quality 80 hero-desktop-1280.avif
magick hero-desktop.webp -resize 1280x720 -quality 80 hero-desktop-1280.webp
magick hero-desktop.webp -resize 1920x1080 -quality 80 hero-desktop-1920.avif
magick hero-desktop.webp -resize 1920x1080 -quality 80 hero-desktop-1920.webp
```

### Using Squoosh CLI

```bash
npm install -g @squoosh/cli

# Convert all to AVIF
squoosh-cli --avif '{"cqLevel": 28}' --resize '{"width": 480, "height": 640}' -d public hero-mobile.webp

# Or use the web interface: https://squoosh.app/
```

### Online Tools

1. **Squoosh** (https://squoosh.app/) - Best for manual conversion
   - Upload image
   - Select AVIF/WebP format
   - Adjust quality to 75-80
   - Resize to target dimensions
   - Download

2. **AVIF.io** (https://avif.io/) - Batch AVIF conversion
3. **CloudConvert** (https://cloudconvert.com/) - Supports batch processing

## Image Quality Guidelines

- **AVIF Quality**: 28-32 (cqLevel) for best compression
- **WebP Quality**: 75-80 for good balance
- Use aggressive compression for backgrounds (hero images)
- Maintain sharp text if present in images
- Test on mobile devices to ensure acceptable quality

## Verification

After generating images, verify:

1. **File sizes meet targets**:
   - Mobile images: ≤60 KB each
   - Tablet images: ≤120 KB each
   - Desktop images: ≤250 KB each

2. **Image dimensions are correct** (use `file` command or image viewer)

3. **Visual quality is acceptable** on real devices

4. **Lighthouse LCP improves**:
   - Target: LCP <2.5s on mobile
   - Run Lighthouse audit to confirm

## Browser Support

- **AVIF**: Chrome 85+, Firefox 93+, Safari 16+ (95% global support)
- **WebP**: Chrome 23+, Firefox 65+, Safari 14+ (97% global support)
- **Fallback**: Original WebP serves as fallback for older browsers

## Expected Performance Gains

- **File Size Reduction**: 30-50% smaller than WebP (AVIF)
- **LCP Improvement**: 1-2 seconds faster on slow 3G
- **Lighthouse Score**: +10-15 points on mobile performance
- **Page Weight**: -200-400 KB total reduction

## Maintenance

- Regenerate images if hero content changes
- Monitor Core Web Vitals for LCP improvements
- Consider using a CDN with automatic image optimization (Cloudflare, Cloudinary)
- Update target sizes based on 75th percentile LCP from real user data
