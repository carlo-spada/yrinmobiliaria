# Image Pipeline Proposal (Server/CI-Centric)

## Goal
Deterministic, site-wide image optimization (current + future assets) that is fast on mobile, LCP-friendly, and enforceable.

## Short Version
- Keep generation off the client.
- Use a small CI/precommit script (sharp/squoosh) to emit AVIF + WebP at fixed breakpoints with size caps.
- Let Supabase handle property/zones via its transform API at runtime; keep static hero/branding as prebuilt assets in `/public`.
- Enforce via a simple check: fail if derivatives are missing/stale.

## Details
1) **Sources & Naming**
   - Store masters in `public/raw` (or Supabase `/raw`), landscape 16:9 unless inherently different.
   - Naming: `hero-{breakpoint}.{format}`, `property-{id}-{size}.{format}`, `zone-{slug}-{size}.{format}`.
   - Alt text lives with metadata (`alt_text_es`, `alt_text_en`).

2) **Breakpoints & Formats**
   - Widths: 480, 640, 768, 1024, 1280, 1920 (2560 optional).
   - Formats: AVIF primary, WebP fallback; JPEG only as legacy.
   - Targets: mobile hero ≤60 KB, desktop hero ≤250 KB, card images ≤120 KB.
   - Aspect: hero 16:9; cards 4:3; square thumbs 1:1.

3) **Generation (CI/Precommit)**
   - Script reads `public/raw/*.png|jpg`, outputs AVIF/WebP per breakpoint into `public/`.
   - Can write a manifest (JSON) with widths/paths if desired.
   - Run in CI or precommit; fail if outputs are missing or stale versus source.

4) **Delivery**
   - **Supabase images (properties/zones):** use transform API with `format=webp` (+ AVIF when available), `resize=cover`, width+height set to desired aspect. Centralize srcset building in `ResponsiveImage`.
   - **Static `/public` assets (hero/branding):** use `<picture>` AVIF→WebP with real breakpoints; preload only the LCP source.

5) **Lint/Checks**
   - Disallow raw `<img src>` to source; use `ResponsiveImage` or `<picture>` with approved widths.
   - CI check to ensure referenced derivatives exist.

6) **Editor Workflow**
   - Editors drop a master; pipeline/CI produces derivatives automatically.
   - Optional: an edge function/worker can generate the same variants on upload (so admins “upload and forget”) without client CPU cost.

## Why Not Client-Side Compression Only
- Heavy on mobile admins; quality control is weaker; WebP-only; fixed widths; no enforcement of size budgets; still uploads the big original before compression.

