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

### ✅ Phase 1 (partial) — repo guardrails wired

- **Branch protection on `main`** (via API): required checks `Typecheck / Lint / Test / Build` + `Dependency audit`; `strict:false`, `enforce_admins:false`. ✓
- **Auto-merge** enabled at repo level (`allow_auto_merge:true`) and used to land PR #17. ✓
- **Still open in Phase 1:** 1.1 env validation, 1.2 Playwright smoke, 1.3 Dependabot, 1.4 pre-commit. Optional: flip `strict:true` and add "require PR before merging" to fully close direct-push to `main`.

### ▶ Next up
Phase 2 (security/RLS/storage — approval-gated for DB) or Phase 7.2 (error boundaries, low-risk). See below.

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

- **1.1** Add env-var validation (Zod schema for `NEXT_PUBLIC_*` at boot). Files: `src/lib/env.ts`. Risk Low, Effort S.
- **1.2** Add `.github/workflows` Playwright smoke against Vercel preview URL (optional, needs preview). Risk Low, Effort M.
- **1.3** Dependabot/renovate config for weekly dep PRs. Risk Low, Effort S.
- **1.4** Pre-commit (lint-staged) optional. Risk Low, Effort S.

---

## Phase 2 — Security / RLS / storage hardening (approval required for DB)

- **2.1 RLS perf + correctness (M1):** wrap `auth.*()`/`is_admin()` in `(select …)`; consolidate overlapping permissive SELECT policies. Files: `policies.sql` + `supabase/manual/NNNN_*.sql`. Risk Medium. Effort M. Acceptance: advisors `auth_rls_initplan`/`multiple_permissive_policies` cleared; RLS behavior unchanged (test as anon/user/agent/admin). Rollback: re-apply prior policy defs.
- **2.2 Index pack (M2):** add covering indexes for hot FKs (`scheduled_visits.agent_id`, `contact_inquiries.assigned_to_agent`, `user_favorites.property_id`, + remaining). Drop 2 unused indexes. Files: `supabase/manual/NNNN_*.sql`. Risk Low. Effort S.
- **2.3 Email escaping (M3):** HTML-escape interpolated user fields; strip CR/LF from header-bound values. Files: `submit-contact`, `submit-schedule-visit`. Risk Low. Effort S.
- **2.4 Upload MIME sniffing (M4):** verify magic bytes; ignore client `contentType`; sanitize `imageId`. Files: `upload-property-image`. Risk Medium. Effort M.
- **2.5 Magic link from `SITE_URL` (M5)** + atomic invite-accept (M6). Files: `send-agent-invitation`, `accept-agent-invitation`. Risk Medium. Effort M.
- **2.6 Public-form abuse (H4):** DB-side rate limit + Turnstile/honeypot. Files: edge fns + new table/policy + client forms. Risk Medium. Effort M.
- **2.7 Revoke EXECUTE on RPC-exposed helpers; enable Auth leaked-password protection (dashboard).** Risk Low. Effort S. Approval required.

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

- **7.1** Route-enforce role guards in `(app)` group (M7). Risk Medium. Effort M.
- **7.2** Add `error.tsx`/`global-error.tsx`/`loading.tsx`; wrap public screens in `ErrorBoundary` (H6). Risk Low. Effort M.
- **7.3** Tailwind consolidation: delete `tailwind.config.ts`, single token scheme, decide dark mode (H11). Risk Medium. Effort M.
- **7.4** Router-shim retirement: migrate 36 call-sites to `next/link`+`next/navigation`, delete shim. Risk Medium. Effort L. (Or, near-term: fix the stale docstring.)
- **7.5** Move `signUp` profile creation to a DB trigger. Risk Medium. Effort S. Approval required.
</content>
