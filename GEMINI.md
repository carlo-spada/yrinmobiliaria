# GEMINI.md — YR Inmobiliaria

> AI-assisted development guide for Gemini. See `CLAUDE.md` for complete project philosophy.

**Last Updated:** December 9, 2025

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

**This is non-negotiable.** Multiple agents and humans contribute to this repo. Working on stale code wastes time and produces invalid analysis.

---

## Project Overview

Modern, bilingual (Spanish/English) real estate platform for YR Inmobiliaria in Oaxaca, Mexico.

### Tech Stack
- **Frontend:** React 19 + TypeScript
- **Build:** Vite 7
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Routing:** React Router 7
- **Data:** TanStack Query
- **Forms:** React Hook Form + Zod
- **i18n:** Custom `LanguageContext` (not i18next)

### Architecture
- **SPA:** Client-side routing via React Router
- **Component-based:** Organized by feature and reusability
- **Lazy loading:** Routes and heavy components load on-demand
- **Hooks for logic:** Business logic in `src/hooks`
- **Direct Supabase:** Frontend communicates directly with Supabase API

---

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server on localhost:5173
npm run build        # Production build to dist/
npm run lint         # ESLint analysis
npm test             # Vitest + RTL test suite
```

---

## Development Conventions

### Imports
Use `@` alias for `src` directory:
```typescript
import { MyComponent } from '@/components/MyComponent';
```

### Styling
- Tailwind CSS utility classes
- Follow design system in `tailwind.config.ts`
- Use existing shadcn/ui components

### State Management
- **Server state:** TanStack Query (fetching, caching, mutations)
- **Local UI state:** `useState` or `useReducer`
- **Global UI state:** `LanguageContext` or new React Context

### Data Fetching
- Encapsulate Supabase queries in hooks (`src/hooks`)
- Transform data to TypeScript types within hooks
- Use auto-generated types from `src/integrations/supabase/types.ts`

### Components
- `src/components/ui` — Reusable UI primitives
- `src/components` — Feature-specific components
- `src/pages` — Top-level route components

### SEO
Include `<MetaTags />` and `<StructuredData />` on new pages.

### Types
- Custom types in `src/types`
- Supabase types auto-generated in `src/integrations/supabase/types.ts`

### Environment
- Secrets managed via Lovable Cloud, not `.env` files in repo
- Never commit API keys or credentials

---

## Auth & Roles

- **AuthContext** (`src/contexts/AuthContext.tsx`) — Central auth state
- **useUserRole** (`src/hooks/useUserRole.ts`) — Role detection
- Roles: `superadmin`, `admin`, `agent`, `user`
- Route guards enforce role-based redirects

---

## Backend Notes

- **DO NOT** create `supabase/migrations/` or `supabase/functions/`
- Lovable Cloud manages all backend changes
- Request schema changes through Lovable prompts
- RLS policies enforce organization-scoped data access

---

## Quality Gates

Before any submission:
- `git fetch && git status` — Verify on latest code
- `npm run lint` — Zero errors
- `npm run build` — Passes without warnings
