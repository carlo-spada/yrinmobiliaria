# Repository Guidelines

## Project Structure & Modules
- Frontend: `src/` (React 18 + TypeScript, Vite). Key areas: `components/`, `pages/`, `hooks/`, `utils/`, `integrations/`.
- Assets: Optimized hero images live in `/public` (AVIF/WebP). Other public assets also live here.
- Styling/config: `tailwind.config.ts`, `postcss.config.js`.
- Routing & maps: `src/pages/MapView.tsx` uses React Leaflet + clustering.
- Docs: project guides and optimization notes in the repo root.

## Build, Test, and Development
- Install deps: `npm install`.
- Dev server: `npm run dev` (Vite).
- Build: `npm run build`.
- Preview built app: `npm run preview`.
- Lint: `npm run lint` (if configured).

## Coding Style & Naming
- TypeScript strict; avoid `any`.
 - Components/hooks in `PascalCase.tsx` / `camelCase.ts`.
- Use existing utilities: `ResponsiveImage` for images; `LanguageContext` for i18n strings.
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
- Backend/Supabase is managed via Lovable Cloud; do **not** add migrations or edge functions here—request changes through Lovable prompts.
- Map page: keep React Leaflet versions compatible with React 18; clustering optional when property count is small.
- Image pipeline: use `ResponsiveImage` with `imageVariants` when available; fallback to Supabase transform is acceptable. Keep hero `<picture>` AVIF-first.

## Security & Configuration
- Do not commit secrets. Environment/config is managed in Lovable Cloud.
- If adding new assets or dependencies, validate build (`npm run build`) to avoid regressions.
