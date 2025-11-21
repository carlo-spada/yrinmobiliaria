# YR Inmobiliaria - Real Estate Website

A modern, bilingual (Spanish/English) real estate website built with React, TypeScript, and Tailwind CSS, showcasing properties in Oaxaca, Mexico.

**Last Updated:** November 20, 2025 (Email Routing & Property Assignment Complete)

---

## 📊 Project Status

**Overall Completion:** 98% 🚀
**Current Phase:** Multi-Agent Platform - User Features & Authentication (Phase 4 of 5)
**Last Updated:** November 20, 2025

**Lighthouse Scores:**
- Desktop: Performance **97/100** ⭐ | Accessibility **96/100** ✅ | Best Practices **100/100** ✅ | SEO **100/100** ✅
- Mobile: Performance **80/100** ⚠️ | Accessibility **96/100** ✅ | Best Practices **100/100** ✅ | SEO **100/100** ✅

**Bundle Size:** 811 KB (optimized from 814 KB)

### ✅ Recently Completed

**Phase 1 (Nov 16 Evening):**
- ✅ Image upload system with WebP optimization
- ✅ Admin panel with 9 management pages (+ Health Check)
- ✅ Supabase Storage integration
- ✅ Enhanced database schema (5 new tables)
- ✅ Admin authentication fixed (race condition resolved)
- ✅ Admin roles automated (auto-grant triggers)

**Phase 2 (Nov 16 Late Night):**
- ✅ **Contact form → Database integration** (saves to `contact_inquiries`)
- ✅ **Schedule form → Database integration** (saves to `scheduled_visits`)
- ✅ **Admin seed route protected** (AdminLayout authentication)
- ✅ **Privacy Policy & Terms pages** (bilingual, fully routed)
- ✅ **Boot-time environment validation** (prevents misconfiguration)
- ✅ **Favorites → Supabase sync** (cross-device for auth users)
- ✅ **Health check page** (monitors 5 critical services)
- ✅ **i18next cleanup** (unified LanguageContext)
- ✅ **Testing checklist** (400+ test cases)

**Phase 3 (Nov 17 SEO & Performance):**
- ✅ **SEO Perfect 100/100!** - Structured data, meta tags, sitemap
- ✅ **Desktop Performance 97/100!** - Code splitting, lazy loading, priority images
- ✅ **Best Practices 100/100!** - Security, HTTPS, no vulnerabilities
- ✅ **Smart Code Splitting** - Map & admin pages load on-demand (~150 KB savings)
- ✅ **Priority Image Loading** - Hero and above-fold images load instantly
- ✅ **Font Optimization** - Preconnect & preload hints for Google Fonts
- ✅ **Route Progress Bar** - Visual feedback during navigation

**Phase 4 (Nov 19-20 Optimization & Multi-Tenant Foundation):**
- ✅ **Bundle Optimization** - Removed unused deps (i18next, embla, cmdk, chart, carousel)
- ✅ **Global Filter Improvements** - Consistent filter behavior across pages
- ✅ **i18n Translations** - Added missing translation keys
- ✅ **Security Fixes** - Enhanced data validation and guards
- ✅ **Data Integrity** - Improved null/undefined handling
- ✅ **Email Integration (Resend)** - Beautiful bilingual email templates for contact & visit forms
- ✅ **Multi-Tenant Foundation** - Database architecture for multi-agent platform (orgs, profiles, roles)

**Phase 5 (Nov 20 Agent Management UI):**
- ✅ **Admin Agents Page** - View, search, and invite agents
- ✅ **Agent Invitation System** - Email invitations with magic link flow (7-day token)
- ✅ **Agent Onboarding Wizard** - 5-step profile completion (photo, bio, contact, zones, social)
- ✅ **Profile Completion Guard** - Redirects incomplete profiles to onboarding
- ✅ **Agent Dashboard** - Protected dashboard with stats (properties, inquiries, visits)
- ✅ **Edit Profile Page** - Agents can update their profile anytime

**Phase 6 (Nov 20 Email Routing & Property Assignment):**
- ✅ **Dynamic Email Routing** - Contact form fetches org email from DB (no hardcoding)
- ✅ **Agent Email Routing** - Visit scheduling routes to property's agent (fallback to org)
- ✅ **Property Auto-Assignment** - New properties auto-assign to uploader's profile
- ✅ **Property Reassignment UI** - Admin can reassign properties with audit logging
- ✅ **useAgents Hook** - Reusable hook for fetching organization agents

### 🎯 Next Steps

**Immediate (This Week):**
- **Multi-Agent Platform (Phases 4-5):**
  - ✅ Multi-tenant foundation (organizations, profiles, roles) - COMPLETE
  - ✅ Agent management UI (invite agents, profile completion) - COMPLETE
  - ✅ Email routing & property assignment - COMPLETE
  - 🚧 User features (registration, auth, favorites, profile) - IN PROGRESS
  - ⏳ Agent directory & public profiles
- **Content Updates** (NO LOVABLE NEEDED):
  - Yas & Carlo: Complete profiles at `/onboarding/complete-profile`
  - Yas: Add properties via `/admin/properties`
  - Write real About Us content

**Next Sprint Priorities:**
1. **Accessibility Improvements** (HIGH) - Score 83 → 95+
   - Add ARIA labels to icon buttons
   - Fix form label associations
   - Improve color contrast ratios
2. **Mobile Performance Optimization** (MEDIUM) - Fix LCP 5.0s → <2.5s
   - Cache headers configuration
   - Responsive images for mobile

**Strategic (1-3 Months):**
- Multi-agent platform (subscription system, agent profiles, custom pages)
- See [STRATEGIC_ROADMAP.md](STRATEGIC_ROADMAP.md) for full details

### 📋 Full Documentation
- **[AUDIT.md](AUDIT.md)** - Detailed 98% completion status + known issues
- **[TESTING_MANUAL.md](TESTING_MANUAL.md)** - Comprehensive manual testing guide
- **[STRATEGIC_ROADMAP.md](STRATEGIC_ROADMAP.md)** - Feature planning & multi-agent platform architecture
- **[CLAUDE.md](CLAUDE.md)** - Project intelligence & Lovable workflow

## 🌟 Features

### Public Features
- **Bilingual Support** - Full Spanish/English translation
- **Property Listings** - Advanced filtering and search
- **Interactive Map** - Leaflet map with property markers (lazy loaded)
- **Favorites System** - ✨ Syncs to Supabase for authenticated users!
- **WhatsApp Integration** - Instant contact button
- **Contact Forms** - ✨ Saves to database + Resend email notifications
- **Schedule Visits** - ✨ Saves to database + Resend email notifications
- **Responsive Design** - Mobile, tablet, desktop optimized
- **SEO Optimized** - ✨ **100/100 score!** Structured data, Open Graph, Twitter Cards
- **Performance Optimized** - ✨ Desktop 94/100! Code splitting, lazy loading, priority images
- **Animations** - Smooth Framer Motion throughout
- **Legal Pages** - ✨ Privacy Policy & Terms of Service (bilingual)

### Admin Features
- **Admin Dashboard** - Stats overview and activity monitoring
- **Property Management** - Full CRUD with image uploads (WebP optimized)
- **Agent Management** - ✨ Invite, view, and manage agents (Nov 20)
- **Inquiry Management** - ✨ View contact form submissions from database
- **Visit Scheduling** - ✨ View scheduled visits from database
- **User Management** - Role-based access control
- **Zone Management** - Service area configuration
- **Audit Logs** - Activity tracking
- **Settings** - Platform configuration
- **Health Check** - ✨ Monitor 5 critical services with response times

### Agent Features ← **NEW!**
- **Agent Dashboard** - Protected dashboard with stats (properties, inquiries, visits)
- **Profile Management** - Complete and edit profile (photo, bio, contact, zones, social)
- **Onboarding Wizard** - 5-step profile completion flow
- **Profile Completion Guard** - Automatic redirect to onboarding if incomplete

## 🚀 Quick Start

```bash
npm install
cp .env.example .env
# Configure .env with your keys
npm run dev
```

## 🌐 Deploy

**Lovable (Recommended):** Click "Publish" button
**Other platforms:** See [DEPLOYMENT.md](DEPLOYMENT.md)

## 📚 Documentation

- **[AUDIT.md](AUDIT.md)** - **START HERE** - Comprehensive project audit with current status
- **[TESTING_MANUAL.md](TESTING_MANUAL.md)** - Manual testing checklist with known issues
- **[STRATEGIC_ROADMAP.md](STRATEGIC_ROADMAP.md)** - Feature planning and growth strategy
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)** - Pre-launch checklist
- **[FEATURES.md](FEATURES.md)** - Detailed features list

## 🔐 Admin Access

Access admin panel at `/admin` (requires admin role)

**Admin Routes:**
- `/admin` - Dashboard
- `/admin/properties` - Property management
- `/admin/agents` - ✨ **NEW!** Agent management (invite, view, search)
- `/admin/inquiries` - Contact inquiries (from database)
- `/admin/visits` - Scheduled visits (from database)
- `/admin/users` - User roles
- `/admin/zones` - Zone management
- `/admin/audit-logs` - Activity logs
- `/admin/settings` - Configuration
- `/admin/health` - ✨ Health check (5 service monitors)
- `/admin/seed` - Database seed (🔒 Protected)

**Agent Routes:** ← **NEW!**
- `/agent/dashboard` - Agent dashboard (protected by ProfileCompletionGuard)
- `/agent/profile/edit` - Edit agent profile
- `/onboarding/complete-profile` - 5-step onboarding wizard
- `/auth/accept-invitation` - Accept agent invitation (magic link)

**Status:** ✅ Fully operational! Auto-admin for ruizvasquezyazmin@gmail.com and carlo.spada22@gmail.com

**Security:** ✅ All admin/agent routes protected with authentication + role checks

## 🔧 Configuration

### Environment Variables

**Frontend (.env):**
```env
# Supabase (✅ Configured)
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key

# Google Analytics (❌ Not configured yet)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# WhatsApp (⚠️ Placeholder)
VITE_WHATSAPP_NUMBER=5219511234567
```

**Edge Functions (Lovable Cloud Dashboard → Settings → Secrets):**
```env
# Resend Email (✅ Configured - Nov 20, 2025)
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### Email Setup (Resend)

**Status:** ✅ **Integrated** (Nov 20, 2025)

The platform uses **Resend** for transactional emails with beautiful bilingual templates.

**Setup Steps:**
1. Sign up at [resend.com](https://resend.com) (free tier: 3,000 emails/month)
2. Verify your domain: `contacto@yrinmobiliaria.com`
3. Get your API key from the Resend dashboard
4. Add to Lovable Cloud:
   - Go to your project settings
   - Navigate to "Secrets" or "Environment Variables"
   - Add: `RESEND_API_KEY=re_xxxxxxxxxxxxx`
5. Deploy Edge Functions with updated env vars

**Features:**
- 📧 Contact form submissions → Email notifications
- 📅 Visit scheduling → Calendar-style email notifications
- 🎨 Beautiful responsive HTML templates
- 🌍 Bilingual support (Spanish)
- 📊 Resend dashboard for analytics
- ✉️ Reply-to configured for easy responses

**Email Templates:**
- **Contact Email:** Purple gradient header, structured client info, CTA button
- **Visit Email:** Green gradient header, calendar card design, property details

**Free Tier Limits:**
- 3,000 emails/month (100/day)
- Perfect for small-to-medium real estate agencies

## 📦 Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (with SWC)
- Tailwind CSS + shadcn/ui
- Framer Motion
- React Router v6
- React Hook Form + Zod
- Custom LanguageContext (i18next removed)
- Leaflet

**Backend:**
- Supabase (PostgreSQL + Auth + Storage)
- Resend (transactional email service)
- Google Analytics 4

**Key Libraries:**
- TanStack React Query
- date-fns
- Lucide Icons
- Leaflet + React Leaflet

---

**Lovable Project**: https://lovable.dev/projects/85042ab5-51cc-4730-a42e-b9fceaafa3a2
