/**
 * Hero Image Optimization Script
 *
 * Generates AVIF and WebP variants at multiple breakpoints for optimal LCP.
 *
 * Usage:
 *   node scripts/generate-hero-images.js [source-image-path]
 *
 * Default source: src/assets/hero-oaxaca.jpg
 * Output: public/hero-*.{avif,webp}
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Configuration
const DEFAULT_SOURCE = './src/assets/hero-oaxaca.jpg';
const OUTPUT_DIR = './public';

// Target sizes with expected file size limits (KB)
// All using 16:9 aspect ratio for consistency
const sizes = [
  // Mobile (16:9, target ≤50 KB)
  { name: 'mobile-480', width: 480, height: 270, maxKB: 50 },
  { name: 'mobile-640', width: 640, height: 360, maxKB: 60 },
  // Tablet (16:9, target ≤100 KB)
  { name: 'tablet-768', width: 768, height: 432, maxKB: 80 },
  { name: 'tablet-1024', width: 1024, height: 576, maxKB: 100 },
  // Desktop (16:9, target ≤200 KB)
  { name: 'desktop-1280', width: 1280, height: 720, maxKB: 150 },
  { name: 'desktop-1920', width: 1920, height: 1080, maxKB: 250 },
];

// Quality settings
const AVIF_QUALITY = 80;
const AVIF_EFFORT = 9; // Max compression (slower but smaller)
const WEBP_QUALITY = 85;
const WEBP_EFFORT = 6;

async function generateImages(sourcePath) {
  console.log('\n🖼️  Hero Image Optimization\n');
  console.log(`Source: ${sourcePath}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  // Verify source exists
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Source image not found: ${sourcePath}`);
    process.exit(1);
  }

  // Get source image info
  const metadata = await sharp(sourcePath).metadata();
  console.log(`Source dimensions: ${metadata.width}×${metadata.height}`);
  console.log(`Source format: ${metadata.format}\n`);

  const results = [];

  for (const size of sizes) {
    const baseName = `hero-${size.name}`;

    // Generate AVIF
    const avifPath = path.join(OUTPUT_DIR, `${baseName}.avif`);
    await sharp(sourcePath)
      .resize(size.width, size.height, {
        fit: 'cover',
        position: 'center'
      })
      .avif({
        quality: AVIF_QUALITY,
        effort: AVIF_EFFORT
      })
      .toFile(avifPath);

    const avifSize = fs.statSync(avifPath).size;
    const avifKB = (avifSize / 1024).toFixed(1);
    const avifStatus = avifSize / 1024 <= size.maxKB ? '✅' : '⚠️';

    // Generate WebP
    const webpPath = path.join(OUTPUT_DIR, `${baseName}.webp`);
    await sharp(sourcePath)
      .resize(size.width, size.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({
        quality: WEBP_QUALITY,
        effort: WEBP_EFFORT
      })
      .toFile(webpPath);

    const webpSize = fs.statSync(webpPath).size;
    const webpKB = (webpSize / 1024).toFixed(1);
    const webpStatus = webpSize / 1024 <= size.maxKB ? '✅' : '⚠️';

    results.push({
      name: baseName,
      dimensions: `${size.width}×${size.height}`,
      avif: `${avifKB} KB ${avifStatus}`,
      webp: `${webpKB} KB ${webpStatus}`,
      target: `≤${size.maxKB} KB`
    });

    console.log(`${avifStatus} ${baseName}.avif (${avifKB} KB)`);
    console.log(`${webpStatus} ${baseName}.webp (${webpKB} KB)`);
  }

  // Summary table
  console.log('\n📊 Summary\n');
  console.log('Name                  | Dimensions  | AVIF       | WebP       | Target');
  console.log('----------------------|-------------|------------|------------|--------');

  for (const r of results) {
    const name = r.name.padEnd(21);
    const dims = r.dimensions.padEnd(11);
    const avif = r.avif.padEnd(10);
    const webp = r.webp.padEnd(10);
    console.log(`${name} | ${dims} | ${avif} | ${webp} | ${r.target}`);
  }

  console.log('\n✅ All hero images generated!\n');
  console.log('Next steps:');
  console.log('1. Verify images look correct');
  console.log('2. Commit changes to git');
  console.log('3. Push to trigger Lovable sync\n');
}

// Main
const sourcePath = process.argv[2] || DEFAULT_SOURCE;
generateImages(sourcePath).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
