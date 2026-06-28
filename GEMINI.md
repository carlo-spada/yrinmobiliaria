# GEMINI.md — YR Inmobiliaria

> AI-assisted development guide for Gemini. See `CLAUDE.md` for complete project architecture.

**Last Updated:** June 28, 2026

---

## SYNC FIRST — MANDATORY

**Before ANY work (audits, reviews, code changes, analysis):**

```bash
git fetch --all && git status -sb
```

If behind origin:
```bash
git stash push -m "WIP before sync" && git pull origin main
```

**Non-negotiable.** Multiple agents and humans contribute. Stale code wastes time and produces invalid analysis.

---

## Project Overview

Modern, bilingual (Spanish/English) real estate platform for YR Inmobiliaria in Oaxaca, Mexico. Live at `yrinmobiliaria.com`.

### Tech Stack
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Backend:** own Supabase (PostgreSQL, Auth, Storage) — single-tenant, role-based
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Maps:** React Leaflet 5
- **Data:** TanStack Query · **Forms:** React Hook Form + Zod
- **i18n:** custom `LanguageContext` (not i18next)
- **Hosting:** Vercel (DNS in Cloudflare) · **Email:** Resend

### Architecture
- **App Router:** file-based routing under `app/`. Public routes are server-rendered (metadata + JSON-LD + sitemap/robots); private routes use `page.tsx` (server) + `view.tsx` (client `dynamic ssr:false`).
- **Navigation:** client screens use native `next/link` + `next/navigation` directly (the `@/lib/router-compat` shim was retired in Phase 7.4); `react-router-dom` is not a dependency. Next-less gaps use `@/components/nav/Navigate`, `@/components/NavLink`, `@/hooks/useSearchParamsState`.
- **Hooks for logic:** business logic in `src/hooks`; screens in `src/screens`.
- **Direct Supabase:** the client talks to Supabase via the browser SSR client; RLS enforces access.

---

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Next dev server
npm run build        # Production build (runs typecheck)
npm run lint         # ESLint
npx vitest run       # Unit tests (Vitest + RTL)
npm run test:e2e     # Playwright smoke
```

---

## Development Conventions

- **Imports:** use the `@` alias for `src` (e.g. `import { X } from '@/components/X'`).
- **Styling:** Tailwind utilities + existing shadcn/ui components.
- **State:** TanStack Query for server state; `useState`/`useReducer` for local UI; React Context (`LanguageContext`) for global UI.
- **Data fetching:** encapsulate Supabase queries in `src/hooks`; transform to TS types there; use generated types from `src/integrations/supabase/types.ts`.
- **Components:** `src/components/ui` primitives · `src/components` feature components · `src/screens` route screens.
- **SEO:** server-side only — metadata via `generateMetadata` and JSON-LD via `@/components/seo/JsonLd` in `app/(public)/**/page.tsx`. Do not add client-side meta/structured-data components.
- **Types:** custom types in `src/types`; Supabase types auto-generated in `src/integrations/supabase/types.ts`.
- **Environment:** public client config is `NEXT_PUBLIC_*` (in `.env`, safe to commit); server secrets live as Supabase Function secrets / Vercel env — never commit keys.

---

## Auth & Roles (single-tenant)

- **AuthContext** (`src/contexts/AuthContext.tsx`) · **useUserRole** (`src/hooks/useUserRole.ts`).
- Roles via `role_assignments`: `superadmin`, `admin`, `agent`, `user`.
- Server gate in `proxy.ts`; client guards in `src/components/auth/NativeRouteGuards.tsx`.

---

## Backend Notes

- Backend is the project's **own Supabase** (`ticsgpyathxawsupcghj`) — no Lovable.
- Edit `supabase/schema.sql` / `policies.sql` / `functions/` in-repo; **apply** to the live project (dashboard or Supabase MCP) **only with the owner's OK**. Hand-applied SQL → `supabase/manual/`.
- The stale `supabase/migrations/` tree is Lovable legacy, not the source of truth.

---

## Quality Gates

Before any submission: `git fetch && git status` · `npm run build` (zero errors, typechecked) · `npm run lint` (zero errors) · `npx vitest run` · `npm run test:e2e`.
