# YR Inmobiliaria - Real Estate Website

A modern, bilingual (Spanish/English) real estate website built with React, TypeScript, and Tailwind CSS, showcasing properties in Oaxaca, Mexico.

## 📊 Project Status

**Overall Completion:** 95% 🚀
**Current Phase:** Production Ready!
**Last Updated:** November 16, 2025 (late night)

### ✅ Recently Completed (Nov 16 - MAJOR UPDATE!)

**Phase 1 (Evening):**
- ✅ Image upload system with WebP optimization
- ✅ Admin panel with 9 management pages (+ Health Check)
- ✅ Supabase Storage integration
- ✅ Enhanced database schema (5 new tables)
- ✅ Admin authentication fixed (race condition resolved)
- ✅ Admin roles automated (auto-grant triggers)

**Phase 2 (Late Night):**
- ✅ **Contact form → Database integration** (saves to `contact_inquiries`)
- ✅ **Schedule form → Database integration** (saves to `scheduled_visits`)
- ✅ **Admin seed route protected** (AdminLayout authentication)
- ✅ **Privacy Policy & Terms pages** (bilingual, fully routed)
- ✅ **Boot-time environment validation** (prevents misconfiguration)
- ✅ **Favorites → Supabase sync** (cross-device for auth users)
- ✅ **Health check page** (monitors 5 critical services)
- ✅ **i18next cleanup** (unified LanguageContext)
- ✅ **Testing checklist** (400+ test cases)

### 🎯 Next Steps
- Yas & Carlo: Sign up at `/auth`
- Yas: Add properties via `/admin/properties`
- Configure EmailJS (optional - forms already save to DB)

### 📋 Full Documentation
- **[AUDIT.md](AUDIT.md)** - Detailed 95% completion status
- **[TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)** - 400+ test cases

## 🌟 Features

### Public Features
- **Bilingual Support** - Full Spanish/English translation
- **Property Listings** - Advanced filtering and search
- **Interactive Map** - Leaflet map with property markers
- **Favorites System** - ✨ Syncs to Supabase for authenticated users!
- **WhatsApp Integration** - Instant contact button
- **Contact Forms** - ✨ Now saves to database + EmailJS (config pending)
- **Schedule Visits** - ✨ Now saves to database + EmailJS (config pending)
- **Responsive Design** - Mobile, tablet, desktop optimized
- **SEO Ready** - Semantic HTML, meta tags, sitemap
- **Animations** - Framer Motion throughout
- **Legal Pages** - ✨ Privacy Policy & Terms of Service (bilingual)

### Admin Features
- **Admin Dashboard** - Stats overview and activity monitoring
- **Property Management** - Full CRUD with image uploads (WebP optimized)
- **Inquiry Management** - ✨ View contact form submissions from database
- **Visit Scheduling** - ✨ View scheduled visits from database
- **User Management** - Role-based access control
- **Zone Management** - Service area configuration
- **Audit Logs** - Activity tracking
- **Settings** - Platform configuration
- **Health Check** - ✨ Monitor 5 critical services with response times

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
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)** - Pre-launch checklist
- **[FEATURES.md](FEATURES.md)** - Detailed features list

## 🔐 Admin Access

Access admin panel at `/admin` (requires admin role)

**Admin Routes:**
- `/admin` - Dashboard
- `/admin/properties` - Property management
- `/admin/inquiries` - Contact inquiries (from database)
- `/admin/visits` - Scheduled visits (from database)
- `/admin/users` - User roles
- `/admin/zones` - Zone management
- `/admin/audit-logs` - Activity logs
- `/admin/settings` - Configuration
- `/admin/health` - ✨ Health check (5 service monitors)
- `/admin/seed` - Database seed (🔒 Protected)

**Status:** ✅ Fully operational! Auto-admin for ruizvasquezyazmin@gmail.com and carlo.spada22@gmail.com

**Security:** ✅ All admin routes protected with authentication + role checks

## 🔧 Configuration

Create `.env` file:
```env
# Supabase (✅ Configured)
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key

# EmailJS (❌ Not configured yet)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID_CONTACT=your_template_id
VITE_EMAILJS_TEMPLATE_ID_SCHEDULE=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# Google Analytics (❌ Not configured yet)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# WhatsApp (⚠️ Placeholder)
VITE_WHATSAPP_NUMBER=5219511234567
```

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
- EmailJS (email service)
- Google Analytics 4

**Key Libraries:**
- TanStack React Query
- date-fns
- Embla Carousel
- Lucide Icons

---

**Lovable Project**: https://lovable.dev/projects/85042ab5-51cc-4730-a42e-b9fceaafa3a2
