# Repository Guidelines for AI Agents

> **Primary Reference:** See `CLAUDE.md` for complete project philosophy and workflow.

**Last Updated:** April 15, 2026

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

## Documentation Discipline

**ABSOLUTE LIMITS:** Maximum 5 root documentation files, maximum 500 lines per file.

**Before creating ANY new document:**
- Can this be added to existing docs?
- Is there an old doc you can delete first?
- Will this doc exist beyond today?
- Could this be code comments instead?

**Every document you modify:**
- Update "Last Updated: [date]" at the top
- Keep content under 500 lines
- Synthesize and consolidate ruthlessly
- Remove transient status updates

**Current Root Docs (5/5 slots):**
1. README.md — Project overview
2. CLAUDE.md — Workflow & philosophy
3. AGENTS.md — This file
4. GEMINI.md — Gemini-specific guidance
5. PRODUCTION_CHECKLIST.md — Launch checklist

**BMAD exception:** Brownfield knowledge belongs in `docs/`, and BMAD workflow artifacts belong in `vault/bmad-output/`. Do not create extra root docs for process artifacts.

---

## Development Model

**Code directly in this repo when possible. Use Lovable ONLY for UI/design and backend.**

**DO code directly:**
- Bug fixes, refactoring, lint fixes
- Type safety improvements
- Test writing, config changes
- Documentation updates, git operations

**USE Lovable ONLY for:**
- UI components, styling, layouts
- Database schema, RLS policies, Edge Functions

**DO NOT:**
- Create `supabase/migrations/` or `supabase/functions/`
- Commit secrets or environment variables
- Work on stale code without syncing first

---

## BMAD Delivery Path

**Canonical BMAD runtime:** `_bmad/` + `.agents/skills/`

**Use BMAD for major work:**
- Features and epics
- Architecture changes
- Multi-file refactors
- Release-readiness and test-planning work

**Direct repo workflow is still fine for:**
- Tiny bug fixes
- Scoped lint/type fixes
- Urgent production patches

**Default major-work path:**
1. `bmad-document-project`
2. `bmad-generate-project-context`
3. Brief or PRFAQ -> PRD -> UX -> architecture -> epics and stories
4. `bmad-check-implementation-readiness`
5. `bmad-sprint-planning`
6. Story cycle: `bmad-create-story` -> validate -> `bmad-dev-story` -> `bmad-code-review`

**Artifact paths:**
- Brownfield knowledge: `docs/index.md`
- Agent context: `vault/bmad-output/project-context.md`
- Planning: `vault/bmad-output/planning-artifacts/`
- Implementation: `vault/bmad-output/implementation-artifacts/`
- Tests: `vault/bmad-output/test-artifacts/`

**Legacy cleanup rule:** Do not reintroduce legacy BMAD prompt trees under `.claude/commands/bmad` or `.codex/prompts/bmad-*`.

---

## Project Structure

```
src/
├── components/     # UI components (shadcn + custom)
│   ├── admin/      # Admin panel components
│   ├── ui/         # shadcn/ui primitives
│   └── layout/     # Layout components
├── contexts/       # AuthContext, LanguageContext
├── hooks/          # Data fetching, auth, utilities
├── pages/          # Route components
│   ├── admin/      # Admin panel pages
│   └── agent/      # Agent dashboard pages
├── integrations/   # Supabase client and types
└── utils/          # Helpers, validation, i18n
```

---

## Build & Test Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server (Vite)
npm run build        # Production build
npm run lint         # ESLint check
npm test             # Vitest + RTL
```

---

## Coding Conventions

- **TypeScript strict:** Avoid `any`
- **Naming:** `PascalCase.tsx` for components, `camelCase.ts` for utilities
- **Bilingual required:** All UI text via `LanguageContext` (ES/EN)
- **Reuse utilities:** `ResponsiveImage` for images, shadcn for UI
- **Assets:** Pre-optimized AVIF/WebP in `/public`

---

## Auth & Roles

- **AuthContext** (`src/contexts/AuthContext.tsx`) — Central auth state
- **useUserRole** (`src/hooks/useUserRole.ts`) — Role detection
- Roles: `superadmin` > `admin` > `agent` > `user`
- Route guards enforce role-based access

---

## Backend Architecture

- **Platform:** Supabase via Lovable Cloud
- **DO NOT** add migrations or edge functions directly
- Request schema changes through Lovable prompts
- RLS policies enforce organization-scoped access

---

## Quality Gates

Before submitting any work:
- `git fetch && git status` — Confirm you're on latest
- `npm run lint` — Zero errors
- `npm run build` — Passes without warnings

---

## Commit Guidelines

- Short, action-oriented messages with prefix (`feat:`, `fix:`, `chore:`)
- Commit only relevant changes
- PRs include: summary, impact on build/perf, manual checks performed
