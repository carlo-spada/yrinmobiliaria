# YR Inmobiliaria — External Config Checklist

**Date:** 2026-06-27
**Purpose:** Vercel / Cloudflare / Supabase-dashboard settings are not in the repo and cannot be audited from code. The owner must supply or verify the items below. **Do not paste secret values** — names and statuses only.

---

## Vercel

- [ ] Project → General: framework preset (Next.js), build command (`next build`), output, install command (`npm ci`).
- [ ] Node.js version setting (should match `.nvmrc` = 22; `engines` requires ≥ 20.19 — the test toolchain `jsdom@27`/`parse5` needs `require(ESM)`, unflagged only in Node ≥ 20.19 / ≥ 22.12).
- [ ] Environment variables — **names only** (confirm presence, not values):
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_PROJECT_ID`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_WHATSAPP_NUMBER`.
  - Confirm **no** `SERVICE_ROLE` / `RESEND_API_KEY` is set as a public (`NEXT_PUBLIC_*`) var.
  - Per-environment scoping (Production vs Preview vs Development) correct?
- [ ] Domains: which domains are attached; is `yrinmobiliaria.com` primary; is `www` an alias/redirect?
- [ ] Redirects/headers defined in the dashboard (since there's no `vercel.json`)? Export them.
- [ ] Deploy protection / preview auth settings.
- [ ] Git: production branch = `main`; is auto-deploy on push confirmed?
- [ ] Security headers strategy (CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy) — currently none in repo; decide Vercel `headers()` vs Cloudflare transform rules.

## Cloudflare

- [ ] DNS records for the apex and `www` (A/AAAA/CNAME → Vercel).
- [ ] Proxy status (orange vs grey cloud) per record. **Recommendation:** decide whether to proxy Vercel; if proxied, set cache rules carefully (below).
- [ ] SSL/TLS mode (should be **Full (strict)**).
- [ ] Always Use HTTPS = on; HSTS configured (max-age, includeSubDomains, preload?).
- [ ] Apex ↔ www redirect behavior (pick one canonical host; must match `NEXT_PUBLIC_SITE_URL` and `robots.host`).
- [ ] WAF: managed rules enabled? custom rules?
- [ ] Rate limiting rules — **recommend** one for the public form edge-function endpoints and `/auth`.
- [ ] Bot protection (Bot Fight Mode / Turnstile) — needed for public forms (see audit H4).
- [ ] Cache rules / page rules / transform rules — export current set.
  - **Must NOT cache:** `/admin/*`, `/agent/*`, `/cuenta`, `/auth/*`, `/onboarding/*`, any authenticated/personalized response, Supabase API calls.
  - **Safe to cache (once static/ISR lands):** static assets, public marketing pages, `/sitemap.xml`, `/robots.txt`.
- [ ] Security level setting.

## Supabase dashboard

- [ ] Auth → Providers/Policies: **enable leaked-password protection** (HaveIBeenPwned) — currently disabled (advisor WARN).
- [ ] Auth → URL config: Site URL + redirect allowlist (must include prod domain + Vercel preview pattern; restrict to trusted hosts — relates to magic-link `origin` finding M5).
- [ ] Auth → email confirmations / signup settings.
- [ ] Edge Functions: confirm deployed `verify_jwt` per function matches `supabase/config.toml`
  (`submit-contact`=false, `submit-schedule-visit`=false, `optimize-property-image`=true, `upload-property-image`=false, `send-agent-invitation`=true, `accept-agent-invitation`=false).
- [ ] Function secrets present (names only): `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`.
- [ ] Resend: sending domain verified (SPF/DKIM) for the `from` address used in invitations/notifications.
- [ ] Storage `property-images` bucket: public-read confirmed; `allowed_mime_types` set (jpeg/png/webp); file-size limit set.
- [ ] Confirm live DB matches repo source-of-truth (`schema.sql`/`policies.sql`/`manual/*`); live migration count is **4** (clean baseline), not the 61 legacy in-repo.
- [ ] Backups / PITR enabled at the plan level.

## DNS / redirect / cache / security cross-checks

- [ ] Single canonical host enforced end-to-end (Cloudflare redirect + Vercel + `NEXT_PUBLIC_SITE_URL` + `robots.host` agree).
- [ ] No double-redirect chains (apex→www→https etc.).
- [ ] `/sitemap.xml` and `/robots.txt` reachable at the canonical host and reference the canonical host.
- [ ] Private prefixes never cached at any layer (Vercel + Cloudflare).
- [ ] Security headers present at exactly one layer (avoid conflicting CSP from both Vercel and Cloudflare).

## Screenshots / exports requested from owner

- [ ] Vercel: Project Settings (General, Environment Variables list, Domains, Git) screenshots.
- [ ] Cloudflare: DNS table, SSL/TLS overview, Rules (cache/page/transform/redirect), WAF, Rate Limiting, Bot, Security Level screenshots.
- [ ] Supabase: Auth settings, Edge Functions list with verify_jwt, Storage bucket config screenshots.
</content>
