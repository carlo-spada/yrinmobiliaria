# optimize-image (stub)

Current state:
- Supabase Edge (Deno) cannot run `sharp`; use Supabase Image Transform API or a WASM codec (e.g., Squoosh) for AVIF/WebP generation.
- The included `index.ts` returns `501 Not implemented` and documents the intended interface.

Intended interface (from Claude’s proposal):
- Input: storage path or signed URL + metadata (property_id, aspect ratio).
- Output: JSON with variant URLs (avif/webp at 480/768/1280/1920), and original dimensions.
- Must strip EXIF (GPS/device info) for privacy.
