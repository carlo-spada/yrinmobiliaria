# YR Inmobiliaria - Real Estate Website

A modern, bilingual (Spanish/English) real estate website built with React, TypeScript, and Tailwind CSS, showcasing properties in Oaxaca, Mexico.

## 📊 Project Status

**Overall Completion:** 72%
**Current Phase:** Fixing Admin Authentication
**Last Updated:** November 16, 2025

### ✅ Recently Completed
- Image upload system with WebP optimization
- Admin panel with 8 management pages
- Supabase Storage integration
- Enhanced database schema (4 new tables)

### ⚠️ In Progress
- Fixing admin auth race condition bug
- Awaiting admin user grants

### 📋 See [AUDIT.md](AUDIT.md) for detailed status

## 🌟 Features

### Public Features
- **Bilingual Support** - Full Spanish/English translation
- **Property Listings** - Advanced filtering and search
- **Interactive Map** - Leaflet map with property markers
- **Favorites System** - Save properties locally
- **WhatsApp Integration** - Instant contact button
- **Contact Forms** - EmailJS integration (config pending)
- **Responsive Design** - Mobile, tablet, desktop optimized
- **SEO Ready** - Semantic HTML, meta tags, sitemap
- **Animations** - Framer Motion throughout

### Admin Features
- **Admin Dashboard** - Stats overview and activity monitoring
- **Property Management** - Full CRUD with image uploads
- **Inquiry Management** - Contact form submissions
- **Visit Scheduling** - Scheduled property visits
- **User Management** - Role-based access control
- **Zone Management** - Service area configuration
- **Audit Logs** - Activity tracking
- **Settings** - Platform configuration

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
- `/admin/inquiries` - Contact inquiries
- `/admin/visits` - Scheduled visits
- `/admin/users` - User roles
- `/admin/zones` - Zone management
- `/admin/audit-logs` - Activity logs
- `/admin/settings` - Configuration

**Note:** Admin authentication currently being fixed (race condition bug)

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
- i18next
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
