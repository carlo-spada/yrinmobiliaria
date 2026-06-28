# YR Inmobiliaria — Audit Report

**Date:** 2026-06-27
**Type:** Read-only audit (no code/DB/DNS/config modified during audit phase)
**Auditor scope:** architecture, Next 16/React 19, Tailwind v4, Supabase DB/RLS/storage, edge functions, security, performance, SEO, analytics/observability, CI/CD, Vercel/Cloudflare, internal docs.

> Severity scale: **Critical / High / Medium / Low / Info**. Evidence cited as `file:line`. Verified against the **live** Supabase project `ticsgpyathxawsupcghj` via MCP.

---

## 1. Executive summary

Fundamentals are healthy: typecheck clean, lint 0-errors, production build green (33 routes), 30/30 unit tests pass, and the **RLS authorization model is genuinely sound** (no privilege-escalation path; leads/audit-logs not anon-readable; helper functions hardened with pinned `search_path`). Versions are modern and mutually compatible (Next 16.2.9 / React 19.2 / Tailwind v4 / Supabase-js 2.87).

The real exposure is **operational safety, SEO reach, and performance/cost**, not present-day correctness:

1. No CI and push-to-`main`-deploys — zero automated gate before production.
2. Bilingual site is effectively monolingual to Google (cookie i18n, one URL/page, self-referential hreflang).
3. Every public SEO page renders dynamically (root layout reads `cookies()` for locale) — no static/edge caching on the highest-traffic surface.
4. Migration governance hazard — 61 stale Lovable migrations in-repo vs a clean 4-migration baseline live.
5. Public forms lack effective rate-limiting / bot protection — spam + Resend cost abuse.

---

## 2. Current architecture overview

- **Routing:** `app/(public)/*` (SSR + `generateMetadata` + server JSON-LD) and `app/(app)/*` (private: `page.tsx` server noindex shell + `view.tsx` client `dynamic ssr:false` mounting `src/screens/*`). No authenticated data is fetched server-side — clean boundary.
- **Auth gate:** `middleware.ts` server-gates the coarse authed/unauthed boundary on `/admin /agent /onboarding /cuenta`; fine-grained role checks run client-side in screens.
- **Compat shim:** `src/lib/router-compat.tsx` emulates react-router over `next/navigation`; **36 files** import it — permanent infrastructure now, not transitional.
- **Data:** 100% client-side TanStack Query against a browser Supabase singleton. `QueryClient` created with no defaults → `refetchOnWindowFocus:true`, `retry:3` app-wide.

### Baseline checks (run 2026-06-27)

| Check | Result |
|---|---|
| node / npm | v25.9.0 / 11.12.1 |
| `npx tsc --noEmit` | 0 errors |
| `npm run lint` | 0 errors, 37 warnings (`react-refresh/only-export-components`, Vite-era rule) |
| `npm run build` | success, 33 routes, all `ƒ Dynamic` except robots/sitemap; warns `middleware`→`proxy`, browserslist stale |
| `npx vitest run` | 30/30 pass (10 files) |
| `npm audit` | 7 vulns (2 low/3 mod/2 high) — all dev-only toolchain |

---

## 3. Critical risks

- **C1 — Client-only i18n makes EN invisible to search engines.** Locale is a cookie defaulting to `es` (`src/lib/seo-server.ts:9`, `app/layout.tsx:52`); switcher only sets `document.cookie` (`src/contexts/LanguageContext.tsx:30`); hreflang sends `es`/`en`/`x-default` to the same canonical (`seo-server.ts:19`). Cookieless crawlers always get ES. **Fix:** locale in URL (`/en/...`) + per-path metadata + reciprocal hreflang. Effort L. Approval required.

---

## 4. High risks

- **H1 — No CI/CD.** `.github/workflows` empty; push to `main` deploys. Fix: GitHub Actions. Effort S.
- **H2 — Public SEO pages all dynamic.** Root layout `cookies()` opts the public tree out of static/ISR; `propiedad/[id]` hits Supabase per request (`page.tsx:20`). Fix: decouple locale from cookies + `generateStaticParams`+ISR. Effort M–L.
- **H3 — Migration governance hazard.** 61 legacy Lovable migrations vs 4 clean live migrations; `schema.sql`+`policies.sql`+`manual/*.sql` are canonical but unenforced. Fix: quarantine `migrations/`, baseline, runbook. Effort S–M. Approval required.
- **H4 — Public-form abuse.** In-memory per-isolate limiter on spoofable `x-forwarded-for` (`submit-contact/index.ts:59`), no CAPTCHA/honeypot. Fix: DB-side limit + Turnstile/honeypot. Effort M. Approval required.
- **H5 — `.env` tracked in git.** Only `NEXT_PUBLIC_*` values today (no live secret exposed) but invites a real secret next. Fix: `git rm --cached .env`. Effort S.
- **H6 — No `error.tsx`/`global-error.tsx`/`loading.tsx`; public screens lack any error boundary.** Fix: add boundaries + skeletons. Effort M.
- **H7 — Placeholder business data in JSON-LD** (`telephone:'+52-951-123-4567'`, `logo:favicon.ico`, placeholder address/social — `seo-server.ts:133-151`). Effort S.
- **H8 — No public CMS/blog route.** `cms_pages` + `/admin/cms` exist; nothing renders publicly or in sitemap. Effort M.
- **H9 — GA loads with no consent gate** (`app/providers.tsx:22`) despite shipped LFPDPPP work. Fix: consent banner + GA Consent Mode v2. Effort M.
- **H10 — Lead conversions not instrumented.** `analytics.ts` `track*` helpers are dead code; contact/schedule/WhatsApp fire no event. Effort M.
- **H11 — Tailwind triple-token drift + dead `tailwind.config.ts` + dead dark mode** (`next-themes` has no provider; no v4 `@custom-variant dark`). Effort M.

---

## 5. Medium / Low / Info findings

### Medium
- **M1 — DB perf lints (68):** 40 `multiple_permissive_policies` + 28 `auth_rls_initplan` (wrap `auth.*()`/`is_admin()` in `(select …)`; consolidate overlapping permissive SELECT policies). Approval required.
- **M2 — 10 unindexed FKs**; hot ones: `scheduled_visits.agent_id`, `contact_inquiries.assigned_to_agent`, `user_favorites.property_id`. 2 unused indexes droppable.
- **M3 — Un-escaped user input in notification emails** (raw `subject`/`message` in submit-contact; `notes` in schedule-visit) → HTML/header injection into staff inbox.
- **M4 — `upload-property-image` trusts client `contentType`**, no magic-byte sniffing; public-read bucket.
- **M5 — `send-agent-invitation` magic link from attacker-controllable `origin` header** → token phishing. Use `SITE_URL`.
- **M6 — `accept-agent-invitation` accept non-atomic (TOCTOU).** Use `UPDATE … WHERE accepted_at IS NULL RETURNING *`.
- **M7 — Role gating by per-screen convention, not route-enforced.** Wrap `(app)` group structurally.
- **M8 — `next.config.ts`:** hardcoded Supabase host fallback; `images.remotePatterns` wildcard `*.supabase.co` (dead until `next/image` adopted).
- **M9 — Node version unpinned** (no `engines`/`.nvmrc`).
- **M10 — `middleware.ts` deprecated** in Next 16 → `proxy.ts`.
- **M11 — TanStack defaults** cause needless refetch/egress.
- **M12 — Docs redundancy / stale claims** (README claims working bilingual SEO; no backend-change runbook).

### Low / Info
- 6 `SECURITY DEFINER` helpers callable by `anon`/`authenticated` via RPC (revoke EXECUTE). Auth leaked-password protection disabled. `imageId` path-traversal in upload (staff-only). Wildcard CORS on all functions. Raw `error.message` returned to clients. `favoritesStorage` lacks `typeof window` guard. `signUp` profile insert client-side (prefer DB trigger). `next/image` unused (LCP gap). Slug logic duplicated, no diacritic normalization.

---

## 6. Dependency / version review

Stack current and compatible (Next 16.2.9 / React 19.2.1 / TS 5.9 / Tailwind 4.1 / Supabase-js 2.87 / @supabase/ssr 0.12). Dead under v4: `tailwindcss-animate`, `autoprefixer`. Last Vite artifact: `@vitejs/plugin-react-swc` (legit — Vitest). All `npm audit` highs dev-only (vite/ws/esbuild/postcss/js-yaml). **Do not mass-upgrade**; the versions are fine.

---

## 7. Security review

- **Strong:** RLS on all 12 tables (37 policies); no escalation (only superadmin grants admin/superadmin; admins limited to agent/user); `audit_logs` write-closed; leads/visits have no INSERT/anon-read (public writes via service-role edge functions); helper fns `STABLE SECURITY DEFINER` + pinned `search_path`; invitation tokens 192-bit CSPRNG + expiry + single-use; accept hardcodes `agent` role; service-role/Resend keys env-only, never in client bundle.
- **Gaps:** see H4, H5, M3–M6, and Low/Info (RPC-exposed helpers, leaked-pw protection, CORS, error leakage).

---

## 8. Supabase / RLS review (verified live)

- RLS enabled on all 12 public tables; 37 policies; live migration count = **4** (clean single-tenant baseline `20260619…`), not the 61 in-repo.
- The DB issues are **performance, not security** (M1, M2).

---

## 9. Performance review

- **Biggest lever:** public pages forced dynamic by `cookies()` in layout (H2) — couple with C1.
- DB: 68 RLS lints (M1) + hot unindexed FKs (M2) will bite as data grows.
- Client: TanStack `refetchOnWindowFocus:true`/`retry:3` (M11); `next/image` unused (LCP).
- Edge functions: service-role clients fine; no realtime/pg_cron/webhooks.

---

## 10. SEO review

- **Critical:** C1 (cookie i18n) — EN not indexable. **High:** H7 (placeholder NAP), H8 (no public CMS). Sitemap works but no per-locale alternates and no 50k pagination guard. robots correct; private routes noindex confirmed. Listings modeled as `Product` (valid; `RealEstateListing` would be richer). Image alts present.

---

## 11. Analytics / observability review

- GA4 only, no consent gate (H9); conversion helpers dead, key funnels (contact/schedule/WhatsApp) untracked (H10); no SPA route-change pageviews; no Sentry/uptime. Recommend: GA Consent Mode v2 + Vercel Analytics/Speed Insights + Sentry (low-ops) + Search Console.

---

## 12. CI/CD review

- None. Recommend GitHub Actions: `npm ci` → `tsc --noEmit` → `eslint` → `vitest run` → `next build`, plus an `audit` job gating on `npm audit --omit=dev --audit-level=high` (prod deps only). Add Node pinning + `.nvmrc` (Node 22; `engines >=20.19` for `require(ESM)`). Optional Playwright smoke against a preview URL.

---

## 13. Vercel / Cloudflare checklist

See `EXTERNAL_CONFIG_CHECKLIST.md` — config not in repo; must be supplied by the owner.

---

## 14. Recommended roadmap (summary)

Detailed phases in `IMPLEMENTATION_PLAN.md`:
0. Immediate safety (CI, untrack `.env`, Node pin, proxy rename, quarantine migrations).
1. CI & guardrails.
2. Security/RLS/storage hardening (M1–M6, email escaping, upload sniffing).
3. Migration governance cleanup + baseline + runbook.
4. Performance & caching (static/ISR, indexes, TanStack defaults, next/image).
5. SEO + blog/CMS readiness (URL i18n, public CMS route, real NAP).
6. Analytics/observability (consent gate, conversion events, Sentry).
7. Architecture cleanup (router-shim retirement, route-enforced guards, Tailwind consolidation).

---

## 15. Top 10 risks (ranked)

1. No CI + push-to-main deploys (H1)
2. `supabase db push` against 61 legacy migrations corrupting prod (H3)
3. EN invisible to Google (C1)
4. Public-form spam / Resend cost abuse (H4)
5. `.env` tracked → next secret committed (H5)
6. All public pages dynamic — load/cost/TTFB (H2)
7. No error boundaries — white-screen on throw (H6)
8. Email HTML/header injection + mislabeled uploads (M3/M4)
9. DB RLS perf cliff (M1/M2)
10. Role gating by convention (M7)

## 16. Top 10 highest-ROI fixes

1. GitHub Actions CI (S)
2. `git rm --cached .env` + `engines`/`.nvmrc` (mins)
3. Quarantine `supabase/migrations/` + runbook (S)
4. `error.tsx`/`global-error.tsx`/`loading.tsx` (S/M)
5. Real NAP/logo in JSON-LD + `middleware`→`proxy` + drop image wildcard (S)
6. DB index pack (3 hot FKs) + wrap RLS predicates in `(select …)` (S/M)
7. HTML-escape emails + magic link from `SITE_URL` + atomic invite-accept (S/M)
8. TanStack defaults (`refetchOnWindowFocus:false`, `retry:1`) (mins)
9. Instrument lead/WhatsApp conversions + SPA pageviews (M)
10. URL-based i18n → unlocks static caching (H2) + EN indexing (C1) (L)
</content>
</invoke>
