# YR Inmobiliaria — Implementation Plan

**Date:** 2026-06-27 · **Last Updated:** 2026-06-28
**Source:** `AUDIT_REPORT.md`. Each task: objective · files · risk · priority · effort · acceptance · tests/checks · rollback.

> Rules: small PR-sized changes; separate commits by category; run quality gates after each batch; never push to `main`; any DB/auth/RLS/storage/DNS/Vercel/Cloudflare change requires explicit approval before execution.

---

## Progress log

### ✅ Phase 0 — DONE (PR [#17](https://github.com/carlo-spada/yrinmobiliaria/pull/17), merged 2026-06-28, merge commit `78dac97`)

All Phase 0 tasks shipped:
- **0.1** `.env` untracked (`.gitignore` gains `!.env.example`). ✓
- **0.2** Node pinned — `.nvmrc` = `22`, `engines.node` = `>=20.19`. Note: initial pin `20.18.0` broke CI (`ERR_REQUIRE_ESM` from `jsdom@27`/`parse5`); corrected to ≥20.19 / LTS 22. ✓
- **0.3** `middleware.ts` → `proxy.ts` (export renamed, `tsconfig` + doc refs updated; deprecation warning gone). ✓
- **0.4** 61 legacy migrations → `supabase/_legacy_migrations/` + `supabase/README.md` governance runbook. ✓
- **0.5** browserslist refreshed. ✓
- **0.6** GitHub Actions CI (`quality` + `audit` jobs); audit gates on prod deps only. ✓

### ✅ Phase 1 — guardrails + env validation (PRs [#17](https://github.com/carlo-spada/yrinmobiliaria/pull/17), [#19](https://github.com/carlo-spada/yrinmobiliaria/pull/19))

- **Branch protection on `main`** (via API): required checks `Typecheck / Lint / Test / Build` + `Dependency audit`; `strict:false`, `enforce_admins:false`. ✓
- **Auto-merge** enabled at repo level (`allow_auto_merge:true`); used to land #17/#18/#19. ✓
- **1.1 Env validation** — `src/lib/env.ts` (Zod, fail-fast en boot, nombra la variable que falla) + centralización de los 13 lectores de `NEXT_PUBLIC_*` (Supabase, SEO/SSR, analytics/WhatsApp) en `env`; elimina la duplicación del default de `SITE_URL`. Test colocado. Revisión adversarial multi-agente previa. PR #19. ✓
- **1.3 Dependabot** — `.github/dependabot.yml` diario agrupado (npm + github-actions), commits `chore(deps)`. PR #19. ✓
- **Dependabot alerts + security updates** activados vía API (carril instantáneo ante avisos GHSA). ✓
- **Diferido:** 1.2 Playwright contra preview (necesita infra de preview/secrets externos); 1.4 pre-commit husky/lint-staged (añade `prepare` a `npm ci` en la ruta de deploy; opcional y CI ya hace lint). Opcional: `strict:true` + "require PR before merging" para cerrar el push directo a `main`.

### ✅ Phase 1 follow-up — ESLint alineado con Next (PR [#22](https://github.com/carlo-spada/yrinmobiliaria/pull/22))
- `@next/eslint-plugin-next` (flat, `recommended`) reemplaza a `eslint-plugin-react-refresh` (artefacto de Vite, falso positivo en App Router). 37 warnings de ruido → 0 errores + 6 warnings de señal real (`@next/next/no-img-element`, pertenecen a la Fase 4.4).

### ✅ Phase 2 — DONE (PRs [#23](https://github.com/carlo-spada/yrinmobiliaria/pull/23) DB, [#24](https://github.com/carlo-spada/yrinmobiliaria/pull/24) edge+cliente, merged 2026-06-28)

Cambios de DB autorizados por el owner para esta fase; migraciones aplicadas vía Supabase MCP; 5 edge functions re-desplegadas (modo "ask" del clasificador del harness).

- **2.1 RLS perf+correctness** ✓ — wrap `(select public.is_X((select auth.uid())))` + una sola política permisiva por (tabla, acción). Advisors `auth_rls_initplan` 28→0 y `multiple_permissive_policies` 40→0; smoke test como anon (lee público, deniega privado). Migraciones `0004`/`0005`; `policies.sql` actualizado.
- **2.2 Index pack** ✓ — 10 índices FK (`0003`) + drop de `profiles_directory_idx` no usado (`0006`); `unindexed_foreign_keys` 10→0.
- **2.3 Email escaping** ✓ — `escapeHtml`/`stripHeader` en `submit-contact`/`submit-schedule-visit`.
- **2.4 Upload MIME sniffing** ✓ — verificación de magic bytes + sanitización de `imageId` en `upload-property-image`.
- **2.5 Magic-link + invite atómico** ✓ — magic link desde `SITE_URL` (server-side) + claim atómico en `send/accept-agent-invitation`.
- **2.6 Anti-abuso** ✓ — honeypot + rate-limit en DB (`rate_limit_events`, `0007`) + Turnstile (componente cliente + verificación edge tras el flag `TURNSTILE_ENFORCE`).
- **2.7 Revoke EXECUTE** ✓ — verificado empíricamente que **rompe RLS** (los helpers se evalúan como el rol que consulta, anon incluido) → **riesgo aceptado documentado** en `policies.sql`. Auth leaked-password protection **diferido** (requiere plan Pro).
- **Pendiente del owner:** site key de Turnstile en Vercel **Preview**; `TURNSTILE_ENFORCE=true` (Supabase secret) para activar la verificación end-to-end (honeypot + rate-limit ya activos).

### ✅ Phase 7 — COMPLETA (7.1–7.5) — resiliencia + guards + estilos + routing + auth (PRs [#26](https://github.com/carlo-spada/yrinmobiliaria/pull/26), [#27](https://github.com/carlo-spada/yrinmobiliaria/pull/27), [#28](https://github.com/carlo-spada/yrinmobiliaria/pull/28), [#31](https://github.com/carlo-spada/yrinmobiliaria/pull/31), [#32](https://github.com/carlo-spada/yrinmobiliaria/pull/32), merged 2026-06-28)

- **7.2 Error boundaries** ✓ (PR #26) — `app/loading.tsx` (Suspense), `app/error.tsx` (segmento, bilingüe vía `LanguageContext`), `app/global-error.tsx` (raíz; `html`/`body` propios + estilos inline + idioma desde la cookie `locale`), y `PublicErrorBoundary` envolviendo las pantallas públicas en `app/(public)/layout.tsx`. Test de `ErrorBoundary`. (H6)
- **7.1 Guards a nivel de ruta** ✓ (PR #27) — `RequireStaff` + layouts anidados `app/(app)/{admin,agent,cuenta,onboarding}/layout.tsx`; el guard corre **por encima** del `view.tsx` (dynamic `ssr:false`), así que un screen sin guard ya no puede quedar expuesto. Se quitaron los guards duplicados por-view, `AdminLayout` quedó como shell puro, y `CompleteProfile` invalida la caché `profile-completion`/`profile` al enviar (evita el rebote a onboarding). Test RTL de `RequireStaff`. (M7)
- **7.3 Consolidación Tailwind v4** ✓ (PR #28) — borrado del `tailwind.config.ts` huérfano (v4 nunca lo cargaba: sin `@config`); `@plugin "tailwindcss-animate"` reactiva 34 animaciones + los overlays de shadcn que estaban muertos desde la migración v3→v4; `@custom-variant dark` pasa el modo oscuro a clase `.dark` (consistente, **dormido**); `components.json` → `config:""`. Verificado por diff del CSS generado: tokens idénticos, animaciones activas, `dark:` ya sin `prefers-color-scheme`. (H11)
- **7.4 Retiro del router-shim** ✓ (PR #31) — borrado `src/lib/router-compat.tsx`; los 33 importadores migrados a `next/link` + `next/navigation` nativos. Lo que Next no tiene nativo va en primitivas propias: `@/components/nav/Navigate`, `@/components/NavLink`, `@/hooks/useSearchParamsState`. Las 3 primitivas + los guards a mano; los ~32 swaps mecánicos vía workflow de 32 agentes, verificados (cero refs residuales, typecheck limpio). Ya no hay dependencia de `react-router-dom`.
- **7.5 Perfil en trigger de DB** ✓ (PR #32) — trigger `on_auth_user_created` + función `handle_new_user` (SECURITY DEFINER, `search_path` fijado, EXECUTE revocado → no aparece en lints 0028/0029) crea el `profile` al alta en `auth.users`, server-side y atómico; elimina el insert client-side de `signUp` (que dejaba huérfanos y fallaba por RLS con confirmación de email). `manual/0008` aplicado vía MCP + verificado con alta de prueba en transacción revertida; advisors sin findings nuevos.

### ▶ Next up
Phase 3 (governance de migraciones), Phase 4 (perf/caching), Phase 5 (SEO i18n), Phase 6 (analytics). **Phase 7 completa.** Ver abajo.

---

## Phase 0 — Immediate safety checks (no runtime/UX/DB change) — ✅ DONE (PR #17)

### 0.1 Untrack `.env`
- **Objective:** stop tracking `.env`; keep `.env.example`.
- **Files:** `.env` (untrack), `.gitignore` (already ignores `.env*`).
- **Risk:** Low. **Priority:** High. **Effort:** S.
- **Acceptance:** `git ls-files | grep '^.env$'` empty; local `.env` still present on disk.
- **Checks:** build still reads env locally.
- **Rollback:** `git add -f .env`.

### 0.2 Pin Node runtime
- **Objective:** prevent runtime drift. Next 16 needs ≥20.9, but the test toolchain (`jsdom@27`/`parse5`) needs `require(ESM)`, unflagged only in Node ≥20.19 / ≥22.12 — so `engines` = `>=20.19` and `.nvmrc` = `22` (current LTS; avoids the deprecated-Node-20 Actions-runner warning).
- **Files:** `package.json` (`engines`), new `.nvmrc`.
- **Risk:** Low. **Priority:** High. **Effort:** S.
- **Acceptance:** `engines.node` set; `.nvmrc` present; build unaffected.
- **Rollback:** revert.

### 0.3 Rename `middleware.ts` → `proxy.ts`
- **Objective:** clear Next 16 deprecation warning.
- **Files:** `middleware.ts` → `proxy.ts` (rename + rename export).
- **Risk:** Medium (auth gate). **Priority:** Medium. **Effort:** S.
- **Acceptance:** build warning gone; private-route redirect still works (manual smoke `/admin` → `/auth`).
- **Rollback:** rename back.

### 0.4 Quarantine legacy migrations + runbook
- **Objective:** remove the `supabase db push` footgun.
- **Files:** `supabase/migrations/` → `supabase/_legacy_migrations/`; new `supabase/README.md` (canonical = `schema.sql`+`policies.sql`+`manual/*.sql`; how to apply/number/rollback DB changes).
- **Risk:** Low (no live DB touched). **Priority:** High. **Effort:** S–M.
- **Acceptance:** `supabase/migrations/` absent; runbook documents governance.
- **Rollback:** rename back.

### 0.5 Refresh browserslist
- **Files:** `package-lock.json` via `npx update-browserslist-db@latest`.
- **Risk:** Low. **Effort:** S. **Acceptance:** build warning gone.

### 0.6 GitHub Actions CI
- **Objective:** gate every PR.
- **Files:** `.github/workflows/ci.yml`.
- **Steps:** `npm ci` → `tsc --noEmit` → `eslint .` → `vitest run` → `next build`; separate `audit` job gates on `npm audit --omit=dev --audit-level=high` (prod deps only; dev-toolchain vulns informational).
- **Risk:** Low. **Priority:** Critical. **Effort:** S.
- **Acceptance:** workflow green on the PR.
- **Rollback:** delete workflow.

---

## Phase 1 — CI & guardrails (follow-ups)

- **1.1** ✅ DONE (PR #19) — env-var validation (Zod schema for `NEXT_PUBLIC_*` at boot) in `src/lib/env.ts`; 13 consumers centralized on the validated `env`. Tested + adversarially reviewed.
- **1.2** ⏸ Deferred — Playwright smoke against a Vercel preview URL (needs preview infra/secrets). Risk Low, Effort M.
- **1.3** ✅ DONE (PR #19) — Dependabot daily, grouped (npm + github-actions); Dependabot alerts + security updates enabled via API.
- **1.4** ⏸ Deferred (optional) — Pre-commit (husky/lint-staged); adds a `prepare` step to the Vercel `npm ci` deploy path and CI already lints. Risk Low, Effort S.

---

## Phase 2 — Security / RLS / storage hardening — ✅ DONE (PRs #23, #24)

- **2.1 RLS perf + correctness (M1):** ✅ wrapped `auth.*()`/`is_*()` as `(select public.is_X((select auth.uid())))`; consolidated overlapping permissive policies (1 per table+action; `FOR ALL` admin split into I/U/D). Advisors `auth_rls_initplan`/`multiple_permissive_policies` → 0. `policies.sql` + `manual/0004`,`0005`. Verified via anon smoke test.
- **2.2 Index pack (M2):** ✅ 10 covering FK indexes (`manual/0003`) + dropped unused `profiles_directory_idx` (`manual/0006`). `unindexed_foreign_keys` → 0.
- **2.3 Email escaping (M3):** ✅ `escapeHtml` interpolated fields + `stripHeader` (CR/LF) on `submit-contact`, `submit-schedule-visit`. Deployed.
- **2.4 Upload MIME sniffing (M4):** ✅ magic-byte sniff (jpeg/png/webp), ignore client `contentType`, sanitize `imageId` in `upload-property-image`. Deployed.
- **2.5 Magic link from `SITE_URL` (M5) + atomic invite-accept (M6):** ✅ server-side `SITE_URL` link in `send-agent-invitation`; atomic claim (`UPDATE … WHERE accepted_at IS NULL`) + un-claim compensation in `accept-agent-invitation`. Deployed.
- **2.6 Public-form abuse (H4):** ✅ DB rate-limit (`rate_limit_events`, `manual/0007`) + honeypot + Turnstile (client `Turnstile` component + edge verify behind `TURNSTILE_ENFORCE` flag).
- **2.7 Revoke EXECUTE on RPC helpers:** ✅ verified empirically that revoke **breaks RLS** (helpers evaluated as the querying role) → **accepted-risk, documented** in `policies.sql`. Auth leaked-password protection: ⏸ **deferred (requires Supabase Pro)**.

---

## Phase 3 — Migration governance cleanup

- **3.1** Generate a verified baseline migration from live schema (export current `schema.sql`/`policies.sql` to a single `0000_baseline` under a chosen tool) and document the forward process. Risk Medium. Effort M. Approval required.
- **3.2** Decide tooling: stay with manual `supabase/manual/NNNN_*.sql` (current) vs Supabase CLI migrations. Document in `supabase/README.md`.

---

## Phase 4 — Performance & caching

- **4.1** Decouple locale from `cookies()` so public pages can be static/ISR (ties to 5.1). Files: `app/layout.tsx`, `src/lib/seo-server.ts`. Risk Medium. Effort L.
- **4.2** `generateStaticParams` + `revalidate` for `propiedad/[id]`, `agentes/[slug]`. Risk Medium. Effort M.
- **4.3** TanStack global defaults (`refetchOnWindowFocus:false`, `retry:1`, sane `staleTime`). Files: `app/providers.tsx`. Risk Low. Effort S.
- **4.4** Adopt `next/image` for hero/PDP gallery; drop image wildcard. Files: `next.config.ts`, `ResponsiveImage`. Risk Medium. Effort M–L.

---

## Phase 5 — SEO + blog/CMS readiness

- **5.1 URL-based i18n (C1)** — path-prefixed `/en`, per-path metadata, reciprocal hreflang, per-locale sitemap. Risk High. Effort L. Approval required (routing). Highest SEO ROI.
- **5.2 Public CMS/blog route (H8)** — `app/(public)/blog/[slug]/page.tsx` + Article JSON-LD + sitemap enumeration of published `cms_pages` + ISR. Risk Medium. Effort M.
- **5.3 Real NAP/logo/social in JSON-LD (H7).** Files: `seo-server.ts`. Risk Low. Effort S.
- **5.4 Centralize slug logic + diacritic normalization.** Risk Low. Effort S.

---

## Phase 6 — Analytics / observability

- **6.1** GA consent gate (Consent Mode v2 + banner) — H9. Risk Low. Effort M.
- **6.2** Wire conversion events (contact/schedule/property-view/WhatsApp/search) + SPA pageviews — H10. Risk Low. Effort M.
- **6.3** Add Sentry (low-ops) + Vercel Analytics/Speed Insights; verify Search Console. Risk Low. Effort M.

---

## Phase 7 — Architecture cleanup / refactors

- **7.1** ✅ DONE (PR #27) — Route-enforce role guards in `(app)` group (M7): `RequireStaff` + nested `admin`/`agent`/`cuenta`/`onboarding` layouts; per-view guards removed; `AdminLayout` → pure shell; `profile-completion` cache invalidation on profile submit. RTL test added.
- **7.2** ✅ DONE (PR #26) — `app/loading.tsx` + `app/error.tsx` + `app/global-error.tsx`; public screens wrapped in `ErrorBoundary` via `PublicErrorBoundary` (H6).
- **7.3** ✅ DONE (PR #28) — Deleted orphaned `tailwind.config.ts`; `@plugin tailwindcss-animate` (restores 34 dead animations) + `@custom-variant dark` (class-based, dormant) in `index.css`; `components.json` `config:""` (H11).
- **7.4** ✅ DONE (PR #31) — Router-shim retired: `src/lib/router-compat.tsx` deleted; 33 importers on native `next/link`+`next/navigation`; non-native cases in `@/components/nav/Navigate` + `@/components/NavLink` + `@/hooks/useSearchParamsState`. No `react-router-dom`.
- **7.5** ✅ DONE (PR #32) — `signUp` profile creation moved to a `handle_new_user` DB trigger on `auth.users` (security definer, EXECUTE revoked, on-conflict-do-nothing); client-side insert removed. `manual/0008`, applied + verified live.
</content>
