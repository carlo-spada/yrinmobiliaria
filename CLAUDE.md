# YR Inmobiliaria — Project Intelligence Brief

> Build with intent; keep the repo lean; ship only after quality gates pass.

**Last Updated:** June 28, 2026

---

## SYNC FIRST — MANDATORY

**Before ANY work (audits, reviews, code changes, analysis):**

```bash
git fetch --all && git status -sb
```

If behind origin, pull or stash+pull:
```bash
git stash push -m "WIP before sync" && git pull origin main
```

**Why:** Multiple contributors (Claude, humans) touch this repo. Stale context = wasted effort and broken analysis.

---

## Non-Negotiables

- **Documentation discipline:** Cap at 5 root docs, each <500 lines. Update "Last Updated" on every edit.
- **Sync before work:** Always pull latest before any analysis or code changes.
- **Own the backend:** The project runs on its **own Supabase** (`ticsgpyathxawsupcghj`), no longer Lovable. Schema/policies/functions live in `supabase/` and are the source of truth. Apply DB changes via the Supabase dashboard or the Supabase MCP — **only with the owner's explicit OK** (these touch the live backend that real users depend on).
- **Bilingual always:** Route all UI strings through `LanguageContext`; never hardcode ES/EN.
- **TypeScript strict:** Avoid `any`, respect React hook rules, keep props typed. `next build` runs typecheck (no `ignoreBuildErrors`).
- **Maps:** React Leaflet, client-side. Validate Oaxaca bounds (lat 15.6–18.7, lng -98.6 to -93.8).
- **Assets:** Optimized AVIF/WebP in `/public` via `ResponsiveImage`. No large raw uploads.
- **Secrets:** Public client config is `NEXT_PUBLIC_*` (safe to commit; incl. `NEXT_PUBLIC_TURNSTILE_SITE_KEY`). Server secrets (`RESEND_API_KEY`, service role, `TURNSTILE_SECRET_KEY`, `TURNSTILE_ENFORCE`) live as Supabase Function secrets / Vercel env — never commit them.

---

## Workflow

1. **Sync:** `git fetch --all && git status -sb` — ALWAYS first
2. **Plan:** Small, explicit steps; prefer direct code solutions
3. **Implement:** Small typed functions; reuse `ResponsiveImage`, `LanguageContext`, shadcn components
4. **Verify:** Run the quality gates below after changes
5. **Document:** Update relevant MD files; stamp the date

---

## Project Architecture

### Tech Stack
- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Maps:** React Leaflet 5 (client-side filtering)
- **Backend:** own Supabase (PostgreSQL, Auth, Storage) — single-tenant, role-based
- **State:** TanStack Query + React Context
- **Forms:** React Hook Form + Zod
- **Hosting:** Vercel (DNS in Cloudflare → Vercel). Domain `yrinmobiliaria.com` is live on Vercel.
- **Email:** Resend (transactional)

### Routing & rendering
- **Public routes** (`app/(public)/…`) are native Next pages with `generateMetadata` (title/desc/canonical/OG/hreflang) + **server-side JSON-LD** (`@/components/seo/JsonLd`). `sitemap.ts` / `robots.ts` are dynamic.
- **Private routes** (`app/(app)/…`: `/admin/*`, `/agent/*`, `/cuenta`, `/auth`, `/onboarding/*`) follow `page.tsx` (server, `robots:noindex`) + `view.tsx` (client `dynamic` with `ssr:false`). Role/auth guards are applied at the **route-group layout** (`app/(app)/<group>/layout.tsx`), above the lazy `view.tsx` — not self-mounted inside each screen. No authenticated data is fetched server-side.
- **`proxy.ts`** refreshes the Supabase session and server-gates the private prefixes (`/admin`, `/agent`, `/onboarding`, `/cuenta`) → redirects to `/auth` when unauthenticated.
- **Navigation:** client screens use **native `next/link` + `next/navigation`** directly (`Link`, `useRouter`, `usePathname`, `useSearchParams`, `useParams`). The old `@/lib/router-compat` react-router shim was retired in Phase 7.4. For the three things Next has no native equivalent, use the purpose-built primitives: `@/components/nav/Navigate` (declarative client redirect), `@/components/NavLink` (active-state link), `@/hooks/useSearchParamsState` (`[params, setParams]` tuple). There is **no `react-router-dom`** dependency.

### Key Directories
```
app/                # Next.js App Router (routes, layouts, metadata, sitemap/robots)
  (public)/         # Public SSR pages
  (app)/            # Private routes (page.tsx server + view.tsx client)
src/
├── components/     # UI components (shadcn + custom); admin/ for the panel; seo/ for JsonLd
├── contexts/       # AuthContext, LanguageContext
├── hooks/          # Data fetching, auth, utilities
├── screens/        # Client screen components mounted by view.tsx (formerly src/pages)
├── integrations/   # Supabase client and generated types
├── lib/            # Supabase SSR helpers, server SEO builders, nav primitives
└── utils/          # Helpers, validation, i18n, image upload
supabase/
├── schema.sql      # Canonical single-tenant schema
├── policies.sql    # Canonical RLS + storage policies
├── functions/      # 6 edge functions
└── manual/         # SQL to apply by hand via dashboard (not auto-migrations)
e2e/                # Playwright smoke specs
proxy.ts
```

### Auth & Roles (single-tenant)
- **AuthContext** (`src/contexts/AuthContext.tsx`) — central auth state.
- **useUserRole** (`src/hooks/useUserRole.ts`) — role detection.
- Roles via `role_assignments`: `superadmin`, `admin`, `agent`, `user`. (`profiles.agent_level` is display-only seniority, not a role.)
- Native guards in `src/components/auth/NativeRouteGuards.tsx` (`RequireAuth`/`RequireRole`/`RequireStaff`/`RequireCompleteProfile`), wired per subtree in `app/(app)/<group>/layout.tsx` (`admin`→`RequireStaff`, `agent`→`RequireRole`, `cuenta`/`onboarding`→`RequireAuth`).
- Route targets: admin → `/admin`, agent → `/agent/dashboard`, user → `/cuenta`.

### Database (Supabase, single-tenant)
- `users` / `profiles` / `properties` / `property_images` / `agent_invitations` / `scheduled_visits` / `contact_inquiries` / `service_zones` / `site_settings` / `role_assignments` / `rate_limit_events` (anti-abuso; RLS deny-all, solo service_role) …
- No `organizations` / `organization_id` (single-tenant). RLS is role-based; storage bucket `property-images` is public-read, staff-write.
- **Edge functions (6):** `submit-contact`, `submit-schedule-visit`, `optimize-property-image`, `upload-property-image`, `send-agent-invitation`, `accept-agent-invitation`. `verify_jwt` per function is set in `supabase/config.toml`; functions that are `verify_jwt=false` (upload-property-image, accept-agent-invitation, the two public forms) do their own auth. Los formularios públicos (`submit-contact`/`submit-schedule-visit`) aplican honeypot + rate-limit en DB (`rate_limit_events`) + verificación Turnstile (activable con `TURNSTILE_ENFORCE=true`); el email escapa todo valor de usuario.
- The stale `supabase/migrations/` tree is **Lovable legacy and not the source of truth** — `schema.sql` + `policies.sql` + `supabase/manual/*.sql` are.

---

## Coding Guardrails

- **Naming:** `PascalCase.tsx` for components, `camelCase.ts` for hooks/utils.
- **Performance:** Lazy/`dynamic` imports for heavy screens; debounce network calls.
- **Accessibility:** Semantic HTML, focus management, aria labels.
- **Testing:** Vitest + RTL (colocated `*.test.ts(x)`); Playwright smoke in `e2e/`.

---

## Quality Gates

Before any PR or deploy:
- `npm run build` — Next build **with typecheck**; zero errors
- `npm run lint` — Zero ESLint errors
- `npx vitest run` — All unit tests green
- `npm run test:e2e` — Playwright smoke green (set `PLAYWRIGHT_BASE_URL` for prod or a local `next start`)
- `npm audit --audit-level=high` — review (current vulns are dev-only transitive deps)

---

## Documentation Files (max 5)

1. **README.md** — Project overview for humans
2. **CLAUDE.md** — This file (workflow & architecture)
3. **AGENTS.md** — Quick reference for AI agents
4. **GEMINI.md** — Gemini-specific conventions
5. **PRODUCTION_CHECKLIST.md** — Launch/readiness checklist

Keep status/history in commits and PRs, not in new root docs.
