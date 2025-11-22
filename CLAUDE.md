# 🎯 YR Inmobiliaria — Project Intelligence Brief

> Build with intent; keep the repo lean; ship only after quality gates pass.

**Last Updated:** November 22, 2025

---

## Non‑Negotiables
- Documentation discipline: cap at five docs, each <500 lines. Update the “Last Updated” stamp on every edit.
- Direct coding first. Lovable is only for UI/visual polish or backend/schema changes—and treat it as a single, high-quality prompt when used.
- No Supabase migrations or edge functions in-repo. Untracked files exist under `supabase/migrations/`; leave them untouched unless Carlo confirms.
- Bilingual always: route all UI strings through `LanguageContext`; never hardcode ES/EN.
- TypeScript stays strict: avoid `any`, respect React hook rules, keep props typed.
- Maps: use React Leaflet with client-side filtering only. Validate Oaxaca bounds (lat 15.6–18.7, lng -98.6 to -93.8) when touching map features.
- Assets: use optimized AVIF/WebP in `/public` (prefer `ResponsiveImage`), no large raw uploads.
- Secrets/config live in Lovable Cloud; never commit credentials.

## Current Audit — November 22, 2025
- `npm run lint` **clean**.
- `npm run build` **passes** (Vite 7.2.4, React 19, React Router 7, React Leaflet 5). Main chunk ~439 KB; map-vendor ~189 KB; auth-vendor ~198 KB; form-vendor ~76 KB.
- `npm audit --audit-level=high` returns **0 vulnerabilities**.
- Tests: Vitest + RTL routing smokes plus coverage for map coords/filtering (bounds/operation), favorites storage/hook (guest & signed-in with Supabase mocks), auth sign-in/up errors, price slider, and admin components.
- Repo status: no untracked migrations; keep Lovable-owned migrations untouched if they appear.

## Immediate Priorities
1. Add deeper auth/map/favorites integration tests as needed.
2. Keep bundle lean; monitor heavy routes after new features.
3. Keep docs synchronized: touch only necessary files, stay under size limits.

## Workflow
1. **Sync:** `git fetch --all && git status -sb` to see Lovable/other changes (do not revert user work).
2. **Plan:** Small, explicit steps; prefer direct code solutions. Use Lovable only for UI/DB asks.
3. **Implement:** Keep functions small and typed; reuse shared utilities (`ResponsiveImage`, `LanguageContext`, shadcn components).
4. **Verify:** At minimum run `npm run lint` and `npm run build` after changes; note any sandbox blocks.
5. **Document:** Update `README.md`, `AGENTS.md`, and `PRODUCTION_CHECKLIST.md` when states shift. Stamp the date.

## Coding Guardrails
- Components/hooks naming: `PascalCase.tsx` / `camelCase.ts`.
- Routing: ensure auth/role guards remain intact (admin → `/admin`, agent → `/agent/dashboard`, user → `/cuenta`).
- Map UX: React Leaflet allowed; clustering optional; keep client-side filtering.
- Performance: prefer lazy imports for admin/map-heavy screens; avoid unnecessary re-renders; debounce networky actions.
- Accessibility: semantic HTML, focus management for dialogs/menus, aria labels on inputs/buttons.

## Release Readiness (see `PRODUCTION_CHECKLIST.md` for detail)
- Zero lint errors; build passes without size outliers.
- Automated tests cover auth/favorites/property flows once harness exists.
- No secrets in git; env wiring validated.
- Lighthouse mobile LCP under control (<2.5s) after bundle trims.
