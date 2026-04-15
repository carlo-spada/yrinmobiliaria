# YR Inmobiliaria — Project Intelligence Brief

> Build with intent; keep the repo lean; ship only after quality gates pass.

**Last Updated:** April 15, 2026

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

**Why:** This project has multiple contributors (Claude, Gemini, Lovable, humans). Stale context = wasted effort and broken analysis. The previous audit was 66 commits behind and analyzed non-existent code.

---

## Non-Negotiables

- **Documentation discipline:** Cap at 5 docs, each <500 lines. Update "Last Updated" on every edit.
- **Sync before work:** Always pull latest before any analysis or code changes.
- **Lovable owns backend:** No Supabase migrations or edge functions in-repo. Apply via Lovable Cloud or Supabase dashboard.
- **Bilingual always:** Route all UI strings through `LanguageContext`; never hardcode ES/EN.
- **TypeScript strict:** Avoid `any`, respect React hook rules, keep props typed.
- **Maps:** React Leaflet with client-side filtering. Validate Oaxaca bounds (lat 15.6–18.7, lng -98.6 to -93.8).
- **Assets:** Optimized AVIF/WebP in `/public` via `ResponsiveImage`. No large raw uploads.
- **Secrets:** Live in Lovable Cloud; never commit credentials.

---

## Workflow

1. **Sync:** `git fetch --all && git status -sb` — ALWAYS first
2. **Plan:** Small, explicit steps; prefer direct code solutions
3. **Implement:** Small typed functions; reuse `ResponsiveImage`, `LanguageContext`, shadcn components
4. **Verify:** Run `npm run lint` and `npm run build` after changes
5. **Document:** Update relevant MD files; stamp the date

## BMAD Transition

- **Canonical BMAD install:** `_bmad/` and `.agents/skills/`
- **Legacy BMAD prompts:** `.claude/commands/bmad` and `.codex/prompts/bmad-*` are being retired; do not recreate them
- **Required for major work:** Features, epics, architecture changes, release/test planning, and multi-file refactors
- **Allowed direct path:** Tiny bug fixes, scoped lint/type cleanups, and urgent patches

### BMAD Artifact Locations
- **Brownfield knowledge:** `docs/index.md`
- **Agent context:** `vault/bmad-output/project-context.md`
- **Planning artifacts:** `vault/bmad-output/planning-artifacts/`
- **Implementation artifacts:** `vault/bmad-output/implementation-artifacts/`
- **Test artifacts:** `vault/bmad-output/test-artifacts/`

### Default Major-Work Path
1. `bmad-document-project`
2. `bmad-generate-project-context`
3. Brief or PRFAQ -> PRD -> UX -> Architecture -> Epics and Stories
4. `bmad-check-implementation-readiness`
5. `bmad-sprint-planning`
6. Story cycle: `bmad-create-story` -> validate -> `bmad-dev-story` -> `bmad-code-review`

Run BMAD skills in fresh contexts when possible. If scope changes invalidate the active plan, use `bmad-correct-course` instead of patching around broken assumptions.

---

## Project Architecture

### Tech Stack
- **Frontend:** React 19, TypeScript, Vite 7, Tailwind 4
- **Routing:** React Router 7
- **Maps:** React Leaflet 5
- **Backend:** Supabase (PostgreSQL, Auth, Storage) via Lovable Cloud
- **State:** TanStack Query + React Context
- **Forms:** React Hook Form + Zod

### Key Directories
```
src/
├── components/     # UI components (shadcn + custom)
├── contexts/       # AuthContext, LanguageContext
├── hooks/          # Data fetching, auth, utilities
├── pages/          # Route components
│   ├── admin/      # Admin panel pages
│   └── agent/      # Agent dashboard pages
├── integrations/   # Supabase client and types
└── utils/          # Helpers, validation, i18n
```

### Auth & Roles
- **AuthContext** (`src/contexts/AuthContext.tsx`) — Central auth state
- **useUserRole** (`src/hooks/useUserRole.ts`) — Role detection
- Roles: `superadmin`, `admin`, `agent`, `user`
- Route guards: admin → `/admin`, agent → `/agent/dashboard`, user → `/cuenta`

### Database Schema (Supabase)
- `users` — System table with role and organization
- `profiles` — User content (display name, bio, photo, etc.)
- `properties` — Property listings with agent assignment
- `organizations` — Multi-tenant org data
- RLS policies enforce org-scoped access

---

## Coding Guardrails

- **Naming:** `PascalCase.tsx` for components, `camelCase.ts` for hooks/utils
- **Performance:** Lazy imports for admin/map screens; debounce network calls
- **Accessibility:** Semantic HTML, focus management, aria labels
- **Testing:** Vitest + RTL; colocate tests as `*.test.ts(x)`

---

## Quality Gates

Before any PR or deploy:
- `npm run lint` — Zero errors
- `npm run build` — Passes without warnings
- `npm audit --audit-level=high` — Zero vulnerabilities

---

## Documentation Files (4/5 slots)

1. **CLAUDE.md** — This file (workflow & philosophy)
2. **AGENTS.md** — Quick reference for all AI agents
3. **GEMINI.md** — Gemini-specific conventions
4. **README.md** — Project overview for humans
5. **PRODUCTION_CHECKLIST.md** — Launch readiness

**Slot 5 is reserved for temporary root docs only.** BMAD artifacts belong in `docs/` and `vault/bmad-output/`, not as new root-level guide files.
