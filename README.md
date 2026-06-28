# YR Inmobiliaria — Real Estate Platform

A modern, bilingual (Spanish/English) real estate website for YR Inmobiliaria, showcasing properties in Oaxaca, Mexico. Live at **[yrinmobiliaria.com](https://yrinmobiliaria.com)**.

**Last Updated:** June 27, 2026

---

## Quick Start

```bash
git clone <repo-url>
cd yrinmobiliaria
npm install
npm run dev          # Next.js dev server
```

**For AI Agents:** Always sync first! See `CLAUDE.md` for the workflow and architecture.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind 4 + shadcn/ui
- **Maps:** React Leaflet 5
- **Backend:** own Supabase (PostgreSQL, Auth, Storage) — single-tenant, role-based
- **State:** TanStack Query + React Context
- **Forms:** React Hook Form + Zod
- **Hosting:** Vercel (DNS in Cloudflare)
- **Email:** Resend (transactional emails)

---

## Features

### Public
- Bilingual support (Spanish/English) with server-rendered SEO (metadata, hreflang, JSON-LD, sitemap/robots)
- Property listings with advanced filtering
- Interactive map with property markers
- Favorites (syncs to Supabase for authenticated users)
- Contact and visit-scheduling forms (Resend email)
- WhatsApp integration
- Responsive design (mobile, tablet, desktop)

### Admin Panel (`/admin`)
Dashboard · property management (CRUD + image uploads) · agent management (invite/onboard) · inquiries & visits · users & roles · zones · audit logs · health · CMS.

### Agent (`/agent`)
Dashboard · profile management · onboarding.

### User (`/cuenta`)
Profile · favorites · account settings.

---

## Project Structure

```
app/                # Next.js App Router — (public)/ SSR pages, (app)/ private routes
src/
├── components/     # UI (shadcn + custom); admin/, auth/, seo/
├── contexts/       # AuthContext, LanguageContext
├── hooks/          # Data fetching, auth, utilities
├── screens/        # Client screens mounted by view.tsx
├── integrations/   # Supabase client + generated types
├── lib/            # router-compat shim, Supabase SSR helpers, SEO builders
└── utils/          # Helpers, validation, i18n, image upload
supabase/           # schema.sql, policies.sql, functions/, manual/, config.toml
e2e/                # Playwright smoke
proxy.ts       # Session refresh + private-route gate
```

---

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server
npm run build        # Production build (runs typecheck)
npm run lint         # ESLint check
npx vitest run       # Unit tests
npm run test:e2e     # Playwright smoke
```

---

## Documentation

- **[CLAUDE.md](CLAUDE.md)** — Project rules, architecture and workflow
- **[AGENTS.md](AGENTS.md)** — AI agent guidelines
- **[GEMINI.md](GEMINI.md)** — Gemini-specific guidance
- **[PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)** — Launch readiness

---

## Deployment

Hosted on **Vercel** (DNS in Cloudflare → Vercel). Pushing to `main` deploys; `NEXT_PUBLIC_*` env vars are set in Vercel (public client config) and server secrets (`RESEND_API_KEY`, Supabase service role) are stored as Supabase Function secrets. Backend DB changes are applied to the project's own Supabase via the dashboard or Supabase MCP.

---

## Auth & Roles (single-tenant)

- **superadmin** — full system access
- **admin** — full staff access
- **agent** — own properties and profile
- **user** — public features + favorites

Route guards: `/admin` (admin/superadmin), `/agent/dashboard` (agents), `/cuenta` (authenticated users). The server gate lives in `proxy.ts`.

---

## Environment

Public client config (safe to commit, in `.env`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_WHATSAPP_NUMBER` (optional)

Server secrets (never commit): `RESEND_API_KEY` and the Supabase service role — stored as Supabase Function secrets. See `.env.example`.

---

## Contributing

1. Sync first: `git fetch --all && git status -sb`
2. Pull if behind: `git pull origin main`
3. Make changes following `CLAUDE.md` conventions
4. Verify: `npm run build && npm run lint && npx vitest run && npm run test:e2e`
5. Commit with a descriptive message (`feat:`, `fix:`, `chore:`)
