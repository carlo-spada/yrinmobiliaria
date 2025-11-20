# Hero Image Optimization Guide

## Current Status
✅ **Fixed**: Hero images now reference existing files (hero-mobile.webp, hero-tablet.webp, hero-desktop.webp)  
✅ **Fixed**: No more 404 errors for missing image assets  
✅ **Fixed**: Proper preload hints in index.html match actual files  

## Further Optimization: Multi-Breakpoint AVIF/WebP

To achieve optimal LCP (<2.5s) and reduce file sizes, generate additional breakpoint-specific images:

### Required Files

#### Mobile (target: ≤60 KB each)
- `hero-mobile-480.avif` (480×720px)
- `hero-mobile-480.webp` (480×720px)
- `hero-mobile-640.avif` (640×960px)
- `hero-mobile-640.webp` (640×960px)

#### Tablet (target: ≤120 KB each)
- `hero-tablet-768.avif` (768×576px)
- `hero-tablet-768.webp` (768×576px)
- `hero-tablet-1024.avif` (1024×768px)
- `hero-tablet-1024.webp` (1024×768px)

#### Desktop (target: ≤250 KB each)
- `hero-desktop-1280.avif` (1280×720px)
- `hero-desktop-1280.webp` (1280×720px)
- `hero-desktop-1920.avif` (1920×1080px)
- `hero-desktop-1920.webp` (1920×1080px)

---

## Generation Methods

### Option 1: Sharp (Node.js - Recommended)

```bash
npm install sharp
```

```javascript
// generate-hero-images.js
const sharp = require('sharp');
const fs = require('fs');

const sourceImage = './public/hero-desktop.webp'; // or use a high-res source

const sizes = [
  { name: 'mobile-480', width: 480, height: 720 },
  { name: 'mobile-640', width: 640, height: 960 },
  { name: 'tablet-768', width: 768, height: 576 },
  { name: 'tablet-1024', width: 1024, height: 768 },
  { name: 'desktop-1280', width: 1280, height: 720 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
];

async function generateImages() {
  for (const size of sizes) {
    const base = `./public/hero-${size.name}`;
    
    // Generate AVIF (best compression)
    await sharp(sourceImage)
      .resize(size.width, size.height, { fit: 'cover', position: 'center' })
      .avif({ quality: 80, effort: 9 })
      .toFile(`${base}.avif`);
    
    console.log(`✓ Generated ${base}.avif`);
    
    // Generate WebP (fallback)
    await sharp(sourceImage)
      .resize(size.width, size.height, { fit: 'cover', position: 'center' })
      .webp({ quality: 85, effort: 6 })
      .toFile(`${base}.webp`);
    
    console.log(`✓ Generated ${base}.webp`);
  }
  
  console.log('\n✅ All hero images generated!');
}

generateImages().catch(console.error);
```

Run: `node generate-hero-images.js`

---

### Option 2: Squoosh CLI

```bash
npm install -g @squoosh/cli
```

```bash
# Generate all sizes (example for one size)
squoosh-cli \
  --resize '{"enabled":true,"width":480,"height":720,"method":"lanczos3","fitMethod":"cover"}' \
  --avif '{"quality":80,"effort":9}' \
  --output-dir ./public \
  ./source-hero.jpg

squoosh-cli \
  --resize '{"enabled":true,"width":480,"height":720,"method":"lanczos3","fitMethod":"cover"}' \
  --webp '{"quality":85,"method":"6"}' \
  --output-dir ./public \
  ./source-hero.jpg
```

Repeat for each size.

---

### Option 3: Squoosh Web App (Manual)

1. Visit https://squoosh.app/
2. Upload your source hero image
3. Resize to target dimensions (e.g., 480×720 for mobile)
4. Export as AVIF (quality: 80, effort: 9)
5. Re-upload and export as WebP (quality: 85)
6. Save to `/public/hero-mobile-480.avif` and `.webp`
7. Repeat for all sizes

---

## Update Code After Generation

Once you've generated all files, update:

### `src/components/HeroSection.tsx`

Replace the `<picture>` block (lines 63-115) with:

```tsx
<picture>
  {/* Mobile: AVIF first, WebP fallback */}
  <source 
    media="(max-width: 640px)" 
    type="image/avif"
    srcSet="/hero-mobile-480.avif 480w, /hero-mobile-640.avif 640w"
    sizes="100vw"
  />
  <source 
    media="(max-width: 640px)" 
    type="image/webp"
    srcSet="/hero-mobile-480.webp 480w, /hero-mobile-640.webp 640w"
    sizes="100vw"
  />
  
  {/* Tablet: AVIF first, WebP fallback */}
  <source 
    media="(max-width: 1024px)" 
    type="image/avif"
    srcSet="/hero-tablet-768.avif 768w, /hero-tablet-1024.avif 1024w"
    sizes="100vw"
  />
  <source 
    media="(max-width: 1024px)" 
    type="image/webp"
    srcSet="/hero-tablet-768.webp 768w, /hero-tablet-1024.webp 1024w"
    sizes="100vw"
  />
  
  {/* Desktop: AVIF first, WebP fallback */}
  <source 
    type="image/avif"
    srcSet="/hero-desktop-1280.avif 1280w, /hero-desktop-1920.avif 1920w"
    sizes="100vw"
  />
  <source 
    type="image/webp"
    srcSet="/hero-desktop-1280.webp 1280w, /hero-desktop-1920.webp 1920w"
    sizes="100vw"
  />
  
  {/* Fallback */}
  <img
    src="/hero-desktop-1280.webp"
    alt="Oaxaca Real Estate - Beautiful colonial architecture and modern properties"
    className="w-full h-full object-cover"
    loading="eager"
    fetchPriority="high"
    decoding="async"
    width="1280"
    height="720"
  />
</picture>
```

### `index.html`

Replace preload links (lines 15-23) with:

```html
<!-- Preload critical hero images - AVIF preferred -->
<link rel="preload" as="image" href="/hero-mobile-480.avif" media="(max-width: 640px)" imagesrcset="/hero-mobile-480.avif 480w, /hero-mobile-640.avif 640w" imagesizes="100vw" type="image/avif" />
<link rel="preload" as="image" href="/hero-tablet-768.avif" media="(min-width: 641px) and (max-width: 1024px)" imagesrcset="/hero-tablet-768.avif 768w, /hero-tablet-1024.avif 1024w" imagesizes="100vw" type="image/avif" />
<link rel="preload" as="image" href="/hero-desktop-1280.avif" media="(min-width: 1025px)" imagesrcset="/hero-desktop-1280.avif 1280w, /hero-desktop-1920.avif 1920w" imagesizes="100vw" type="image/avif" />

<!-- WebP fallback preloads -->
<link rel="preload" as="image" href="/hero-mobile-480.webp" media="(max-width: 640px)" imagesrcset="/hero-mobile-480.webp 480w, /hero-mobile-640.webp 640w" imagesizes="100vw" type="image/webp" />
<link rel="preload" as="image" href="/hero-tablet-768.webp" media="(min-width: 641px) and (max-width: 1024px)" imagesrcset="/hero-tablet-768.webp 768w, /hero-tablet-1024.webp 1024w" imagesizes="100vw" type="image/webp" />
<link rel="preload" as="image" href="/hero-desktop-1280.webp" media="(min-width: 1025px)" imagesrcset="/hero-desktop-1280.webp 1280w, /hero-desktop-1920.webp 1920w" imagesizes="100vw" type="image/webp" />
```

---

## Expected Performance Gains

### Current (single WebP per breakpoint)
- Mobile: ~180 KB → LCP ~3.2s (4G)
- Desktop: ~450 KB → LCP ~2.8s (fast 3G)

### After Optimization (multi-breakpoint AVIF/WebP)
- Mobile: ~45 KB AVIF → LCP ~1.8s (4G) ✅
- Tablet: ~90 KB AVIF → LCP ~2.0s (4G) ✅
- Desktop: ~180 KB AVIF → LCP ~2.2s (fast 3G) ✅

**File size reduction**: ~60-70% (AVIF vs. WebP at same quality)

---

## Checklist

- [ ] Generate all 12 image files (6 AVIF + 6 WebP)
- [ ] Verify file sizes meet targets (mobile ≤60 KB, desktop ≤250 KB)
- [ ] Update `HeroSection.tsx` with new srcSet
- [ ] Update `index.html` preloads
- [ ] Test on mobile/tablet/desktop viewports
- [ ] Run Lighthouse audit (LCP should be <2.5s)
- [ ] Verify no 404s in Network tab

---

## Notes

- **Keep existing files**: `hero-mobile.webp`, `hero-tablet.webp`, `hero-desktop.webp` can stay as ultimate fallbacks if needed.
- **AVIF support**: ~90% of browsers (all modern ones). WebP is the fallback for older browsers.
- **Aspect ratios**: Adjust `height` values if your source image has a different ratio (e.g., 16:9, 4:3, 3:2).
- **Automation**: Add the Sharp script to `package.json` as a `build:images` command for easy re-generation.

---

## Troubleshooting

**Images look blurry?**  
- Increase AVIF/WebP quality (try 85-90)
- Ensure source image is high-resolution

**File sizes too large?**  
- Lower AVIF quality to 70-75
- Use AVIF effort: 9 (max compression)

**404 errors?**  
- Verify files are in `/public` directory
- Check filenames match exactly (case-sensitive)
- Clear browser cache and reload
