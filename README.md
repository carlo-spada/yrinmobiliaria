# YR Inmobiliaria — Real Estate Platform

A modern, bilingual (Spanish/English) real estate website for YR Inmobiliaria, showcasing properties in Oaxaca, Mexico.

**Last Updated:** December 9, 2025

---

## Quick Start

```bash
git clone <repo-url>
cd yrinmobiliaria
npm install
npm run dev
```

**For AI Agents:** Always sync first! See `CLAUDE.md` for workflow.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 7, Tailwind 4
- **Routing:** React Router 7
- **Maps:** React Leaflet 5
- **Backend:** Supabase (PostgreSQL, Auth, Storage) via Lovable Cloud
- **State:** TanStack Query + React Context
- **Forms:** React Hook Form + Zod
- **Email:** Resend (transactional emails)

---

## Features

### Public
- Bilingual support (Spanish/English)
- Property listings with advanced filtering
- Interactive map with property markers
- Favorites system (syncs to Supabase for authenticated users)
- Contact and visit scheduling forms
- WhatsApp integration
- SEO optimized (structured data, Open Graph)
- Responsive design (mobile, tablet, desktop)

### Admin Panel (`/admin`)
- Dashboard with stats overview
- Property management (CRUD with image uploads)
- Agent management (invite, onboard, manage)
- Inquiry and visit management
- User and role management
- Zone configuration
- Audit logs
- Health check monitoring

### Agent Features (`/agent`)
- Agent dashboard with stats
- Profile management
- Onboarding wizard

### User Features (`/cuenta`)
- Profile management
- Favorites display
- Account settings

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

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server
npm run build        # Production build
npm run lint         # ESLint check
npm test             # Run tests
```

---

## Documentation

- **[CLAUDE.md](CLAUDE.md)** — Project rules and workflow
- **[AGENTS.md](AGENTS.md)** — AI agent guidelines
- **[GEMINI.md](GEMINI.md)** — Gemini-specific guidance
- **[PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)** — Launch readiness

---

## Deployment

Managed via **Lovable Cloud**:
- Click "Publish" in the Lovable interface
- Environment variables configured in Lovable Cloud Settings
- Supabase migrations applied via Lovable or Supabase dashboard

---

## Auth & Roles

- **superadmin** — Full system access
- **admin** — Organization-scoped access
- **agent** — Own properties and profile
- **user** — Public features + favorites

Route guards:
- `/admin` — admin/superadmin only
- `/agent/dashboard` — agents only
- `/cuenta` — authenticated users

---

## Environment

Secrets are managed in Lovable Cloud (not committed):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `RESEND_API_KEY` (Edge Functions)

---

## Contributing

1. Sync first: `git fetch --all && git status -sb`
2. Pull if behind: `git pull origin main`
3. Make changes following `CLAUDE.md` conventions
4. Verify: `npm run lint && npm run build`
5. Commit with descriptive message (`feat:`, `fix:`, `chore:`)

---

**Lovable Project:** https://lovable.dev/projects/85042ab5-51cc-4730-a42e-b9fceaafa3a2
