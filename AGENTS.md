# Repository Guidelines

> **Primary Reference**: See `CLAUDE.md` for complete project philosophy, workflow, and Lovable prompt engineering guidelines.

**Last Updated:** November 20, 2025

---

## 🚨 DOCUMENTATION DISCIPLINE

**CRITICAL RULE: Maximum 5 documentation files, 20,000 words each.**

**Before creating ANY new document:**
- ❌ **STOP** - Can this be added to existing docs?
- ❌ **STOP** - Is there an old doc you can delete first?
- ❌ **STOP** - Will this doc exist beyond today?

**Every document you modify:**
- ✅ Update "Last Updated: [date]" at the top
- ✅ Keep content under 20,000 words
- ✅ Synthesize and consolidate

**Current Docs (3/5 slots):**
1. README.md
2. CLAUDE.md
3. AGENTS.md (this file)

**If you need slot 4 or 5:** Delete a temporary doc first.

---

## Critical Constraint: Lovable-First Development

This project uses **Lovable Cloud** with managed Supabase. All code changes must go through Lovable prompts.

- ❌ Do NOT edit code directly in this repo
- ❌ Do NOT create `supabase/migrations/` or `supabase/functions/`
- ❌ Do NOT use react-leaflet v5.x (requires React 19)
- ✅ DO coordinate with Claude Code for prompt drafting
- ✅ DO use react-leaflet 4.x (compatible with React 18)
- ✅ DO use `--legacy-peer-deps` flag if npm install fails

## Project Structure & Modules
- Frontend: `src/` (React 18 + TypeScript, Vite). Key areas: `components/`, `pages/`, `hooks/`, `utils/`, `integrations/`.
- Assets: Optimized hero images in `/public` (AVIF/WebP). Generate with `node scripts/generate-hero-images.js`.
- Styling/config: `tailwind.config.ts`, `postcss.config.js`.
- Maps: `src/pages/MapView.tsx` uses React Leaflet 4.x + optional clustering.
- Docs: `CLAUDE.md` (primary), `AUDIT.md` (status), guides in repo root.

## Build, Test, and Development
- Install deps: `npm install`.
- Dev server: `npm run dev` (Vite).
- Build: `npm run build`.
- Preview built app: `npm run preview`.
- Lint: `npm run lint` (if configured).

## Coding Style & Naming
- TypeScript strict; avoid `any`.
- Components/hooks in `PascalCase.tsx` / `camelCase.ts`.
- **Bilingual required**: All UI text must support ES/EN via `LanguageContext`. No hardcoded strings.
- Use existing utilities: `ResponsiveImage` for images; `LanguageContext` for i18n.
- JSX: prefer functional components; keep props typed.
- Assets: use pre-optimized AVIF/WebP in `/public`; do not reintroduce large unoptimized files.

## Testing Guidelines
- No dedicated test suite is present; at minimum, run `npm run build` before committing.
- If adding tests, colocate under the feature path and name them `*.test.ts(x)`.

## Commit & PR Guidelines
- Follow short, action-oriented messages with a prefix when possible (`feat:`, `fix:`, `chore:`).
- Commit only relevant changes; keep generated assets intentional.
- PRs should include: summary of changes, impact on build/perf, and manual checks performed (e.g., `/mapa` render, hero LCP-sensitive areas).

## Architecture Notes (Agents)
- **Backend**: Managed via Lovable Cloud. Do NOT add migrations or edge functions—request through Lovable prompts.
- **Map page**:
  - Use react-leaflet 4.x (NOT 5.x which requires React 19)
  - Client-side filtering only (do NOT add server-side bounds filtering)
  - Clustering optional for small datasets (≤20 properties)
- **Image pipeline**:
  - Use `ResponsiveImage` with `imageVariants` when available
  - Supabase transform API as fallback
  - Hero uses `<picture>` with AVIF-first srcset
- **Current phase**: Map UX polish, then Oaxaca coordinate validation (bounds: lat 15.6-18.7, lng -98.6 to -93.8)

## Security & Configuration
- Do not commit secrets. Environment/config is managed in Lovable Cloud.
- If adding new assets or dependencies, validate build (`npm run build`) to avoid regressions.
