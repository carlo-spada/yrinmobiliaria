# Repository Guidelines for AI Agents

> **Primary Reference**: See `CLAUDE.md` for complete project philosophy and workflow.

**Last Updated:** November 21, 2025

---

## 🚨 DOCUMENTATION DISCIPLINE

**ABSOLUTE LIMITS: Maximum 5 files, Maximum 5,000 words (~500 lines) per file.**

**Before creating ANY new document:**
- ❌ **STOP** - Can this be added to existing docs?
- ❌ **STOP** - Is there an old doc you can delete first?
- ❌ **STOP** - Will this doc exist beyond today?
- ❌ **STOP** - Could this be code comments instead?

**Every document you modify:**
- ✅ Update "Last Updated: [date]" at the top
- ✅ Keep content under 500 lines
- ✅ Synthesize and consolidate ruthlessly

**Current Docs (4/5 slots):**
1. README.md - Project overview
2. CLAUDE.md - Workflow & philosophy
3. AGENTS.md - This file
4. PRODUCTION_CHECKLIST.md - Launch checklist

**Slot 5:** Reserved for temporary docs only (delete after use)

---

## Development Model: Direct Coding First

**Code directly in this repo when possible. Use Lovable ONLY for UI/design and backend.**

**✅ DO code directly via Claude Code:**
- Bug fixes, refactoring, ESLint fixes
- Type safety improvements, dependency updates
- Test writing, configuration changes
- Documentation updates, git operations

**🎨 USE Lovable ONLY for:**
- UI components, styling, layouts, animations
- Database schema, RLS policies, Edge Functions

**❌ DO NOT:**
- Create `supabase/migrations/` or `supabase/functions/` (Lovable Cloud manages these)
- Use react-leaflet v5.x (requires React 19; use 4.x)
- Commit secrets or environment variables

## Project Structure & Modules
- Frontend: `src/` (React 19 + TypeScript, Vite 7). Key areas: `components/`, `pages/`, `hooks/`, `utils/`, `integrations/`.
- Assets: Optimized hero images in `/public` (AVIF/WebP). Generate with `node scripts/generate-hero-images.js`.
- Styling/config: `tailwind.config.ts`, `postcss.config.js`.
- Maps: `src/pages/MapView.tsx` uses React Leaflet 4.x + optional clustering.
- Docs: `CLAUDE.md` (primary), `AGENTS.md`, `README.md`, `PRODUCTION_CHECKLIST.md`.

## Build, Test, and Development
- Install deps: `npm install`.
- Dev server: `npm run dev` (Vite).
- Build: `npm run build`.
- Lint: `npm run lint`.
- Tests: `npm test` (Vitest + RTL). Current coverage is minimal routing smokes.

## Coding Style & Naming
- TypeScript strict; avoid `any`.
- Components/hooks in `PascalCase.tsx` / `camelCase.ts`.
- **Bilingual required**: All UI text must support ES/EN via `LanguageContext`. No hardcoded strings.
- Use existing utilities: `ResponsiveImage` for images; `LanguageContext` for i18n.
- JSX: prefer functional components; keep props typed.
- Assets: use pre-optimized AVIF/WebP in `/public`; do not reintroduce large unoptimized files.

## Testing Guidelines
- Tests: `npm test` (Vitest + RTL). Current coverage: routing smokes + utilities (map coords, favorites storage/hook).
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
- **Current phase**: Technical debt cleanup (lint + bundle). Oaxaca bounds: lat 15.6-18.7, lng -98.6 to -93.8

## Security & Configuration
- Do not commit secrets. Environment/config is managed in Lovable Cloud.
- Leave any Lovable-generated `supabase/migrations/*` untouched unless directed.
- Build is currently passing with a ~631 KB main chunk warning; map-vendor chunk is split (~199 KB). Reduce bundle further and expand tests before shipping.
