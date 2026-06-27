# Repository Guidelines for AI Agents

> **Primary Reference:** See `CLAUDE.md` for complete project architecture and workflow.

**Last Updated:** June 27, 2026

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

**Non-negotiable.** Multiple agents and humans contribute. Working on stale code wastes time and produces invalid analysis.

---

## Documentation Discipline

**ABSOLUTE LIMITS:** Maximum 5 root documentation files, maximum 500 lines per file.

Before creating ANY new doc: can it go in an existing one? Can you delete an old one first? Will it outlive today? Could it be code comments instead?

On every doc you edit: update "Last Updated", keep it under 500 lines, consolidate ruthlessly, drop transient status. Keep history in commits/PRs, not new root docs.

**Root docs (5/5):** README.md · CLAUDE.md · AGENTS.md · GEMINI.md · PRODUCTION_CHECKLIST.md

---

## Development Model

**Code directly in this repo.** Frontend and backend (`supabase/`) both live here.

- **DO code directly:** features, bug fixes, refactors, lint/type fixes, tests, config, docs, edge functions, schema/policy edits.
- **Backend changes touch a live Supabase** (`ticsgpyathxawsupcghj`) that real users depend on. Edit `supabase/schema.sql` / `policies.sql` / `functions/` in-repo, but **apply** to the live project (dashboard or Supabase MCP) **only with the owner's explicit OK**. For hand-applied SQL use `supabase/manual/NNNN_*.sql`.
- **DO NOT:** commit secrets/credentials, or work on stale code without syncing.
- The stale `supabase/migrations/` tree is Lovable legacy — `schema.sql` + `policies.sql` are canonical.

---

## Project Structure

```
app/                # Next.js App Router — (public)/ SSR pages, (app)/ private routes
src/
├── components/     # UI (shadcn + custom); admin/, auth/, seo/
├── contexts/       # AuthContext, LanguageContext
├── hooks/          # Data fetching, auth, utilities
├── screens/        # Client screens mounted by view.tsx (was src/pages)
├── integrations/   # Supabase client + generated types
├── lib/            # router-compat shim, Supabase SSR helpers, SEO builders
└── utils/          # Helpers, validation, i18n, image upload
supabase/           # schema.sql, policies.sql, functions/, manual/, config.toml
e2e/                # Playwright smoke
middleware.ts       # Session refresh + private-route gate
```

Private routes = `page.tsx` (server, `robots:noindex`) + `view.tsx` (client `dynamic ssr:false`) over a screen that self-mounts its guard/layout.

---

## Build & Test Commands

```bash
npm install          # Install dependencies
npm run dev          # Next dev server
npm run build        # Production build (runs typecheck)
npm run lint         # ESLint check
npx vitest run       # Unit tests (Vitest + RTL)
npm run test:e2e     # Playwright smoke (PLAYWRIGHT_BASE_URL for prod / local next start)
```

---

## Coding Conventions

- **TypeScript strict:** avoid `any`; `next build` typechecks.
- **Naming:** `PascalCase.tsx` for components, `camelCase.ts` for utilities.
- **Bilingual required:** all UI text via `LanguageContext` (ES/EN).
- **Reuse:** `ResponsiveImage` for images, shadcn for UI, the `@/lib/router-compat` shim for navigation in client screens (no `react-router-dom`).
- **SEO:** public-page metadata + JSON-LD are produced server-side in `app/(public)/**/page.tsx` (via `generateMetadata` and `@/components/seo/JsonLd`) — do not add client-side meta/JSON-LD components.
- **Assets:** pre-optimized AVIF/WebP in `/public`.

---

## Auth & Roles (single-tenant)

- **AuthContext** (`src/contexts/AuthContext.tsx`) · **useUserRole** (`src/hooks/useUserRole.ts`).
- Roles via `role_assignments`: `superadmin` > `admin` > `agent` > `user`.
- Server gate in `middleware.ts` (`/admin`, `/agent`, `/onboarding`, `/cuenta`); client guards in `src/components/auth/NativeRouteGuards.tsx`.

---

## Quality Gates

Before submitting: `git fetch && git status` (latest) · `npm run build` (zero errors, incl. typecheck) · `npm run lint` (zero errors) · `npx vitest run` · `npm run test:e2e`.

---

## Commit Guidelines

- Short, action-oriented messages with prefix (`feat:`, `fix:`, `chore:`).
- Commit only relevant changes.
- PRs include: summary, impact on build/perf, manual checks performed.
