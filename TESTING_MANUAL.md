# YR Inmobiliaria - Manual Testing Checklist

**Date:** November 20, 2025
**Purpose:** Comprehensive manual testing after recent Lovable implementations
**Test Environment:** Local dev server (`npm run dev`) or preview build (`npm run preview`)

---

## Pre-Test Setup

- [ ] Open browser DevTools (F12)
- [ ] Keep Console tab visible to catch errors
- [ ] Test in both Chrome and Safari/Firefox
- [ ] Prepare to test mobile viewport (DevTools device emulator or resize)

---

## 1. HOMEPAGE (`/`) - Hero Section

### Visual/Layout
- [ ] Hero image loads (AVIF/WebP, no 404)
- [ ] No header overlap on content
- [ ] Layout responsive on mobile

### Filters - Critical Issue Check
- [ ] **Price slider:** Should be dual-handle (min/max) - Currently SINGLE-HANDLE ❌
- [ ] **Zone dropdown:** Shows real zones from database
- [ ] **Type dropdown:** Shows property types
- [ ] **Operation filter:** Buy/Rent selector - Currently MISSING ❌

### Language Switch
- [ ] Switch to English - all text translates
- [ ] Zone dropdown still works (zones display in correct language)
- [ ] Type dropdown translates (House, Apartment, Commercial, Office)
- [ ] Switch back to Spanish - everything reverts

### Search Functionality
- [ ] Select filters → Click search
- [ ] Navigates to `/propiedades` with URL params
- [ ] Params persist (type, zone, price, operation)

### Console
- [ ] No errors in console
- [ ] No 404s in Network tab

---

## 2. PROPERTIES PAGE (`/propiedades`)

### Layout
- [ ] Property cards grid displays
- [ ] Sidebar filters visible
- [ ] No header overlap
- [ ] Mobile: Filters accessible

### Filters - Known Issues
- [ ] **Price slider:** Dual-handle (min/max) ✅ Expected
- [ ] **Zone filter:** Uses stable values (not language-dependent) - Currently BROKEN in EN ❌
- [ ] **Type filter:** Labels translated in EN (House, Apartment...) - May be RAW ("casa") ❌
- [ ] **Operation filter:** Buy/Rent toggle
- [ ] **Bedrooms/Bathrooms:** Number inputs work

### Filter Behavior
- [ ] Apply filters → property count updates ("Mostrando X de Y")
- [ ] Active filter badges appear
- [ ] Click badge "X" → filter removes
- [ ] "Clear all filters" → resets to all properties
- [ ] URL params update when filters change

### Zone Filter Test (Critical)
1. Set zone filter to "Centro Histórico" in Spanish
2. Switch language to English
3. **Expected:** Zone filter still works, shows translated name
4. **Bug:** May show 0 results if using unstable values ❌

### Property Cards
- [ ] Images load (no broken images)
- [ ] Price formatted correctly (MXN with commas)
- [ ] Status badge translated ("For Sale" / "En Venta")
- [ ] Featured badge ("⭐ Featured" / "⭐ Destacado") - Check translation
- [ ] Location shows (zone + neighborhood)
- [ ] Features show (bedrooms, bathrooms, area)

### Empty State
- [ ] Apply filters that match 0 properties
- [ ] Shows "No properties found" message
- [ ] "Clear filters" button works

### Console
- [ ] No errors
- [ ] No warnings about missing translations

---

## 3. MAP PAGE (`/mapa`)

### Layout - Recent Fixes
- [ ] **Header overlap:** Content sits below header (not behind) ✅ Fixed
- [ ] **Sidebar scroll:** List scrolls independently ✅ Fixed
- [ ] Map renders without error fallback

### Filters
- [ ] **Price slider:** Dual-handle (min/max) ✅ Expected
- [ ] Zone dropdown works
- [ ] Type filter works
- [ ] Property count shows ("Mostrando X de Y") ✅ Expected

### Map Controls - Recent Additions
- [ ] **Reset view button:** Exists? Returns to show all properties? ✅ Expected
- [ ] Zoom controls work
- [ ] Location button (user geolocation) works

### Clustering - Known Issue
- [ ] Load page with few properties (<20)
- [ ] **Issue:** Clustering still enabled (adds visual clutter/jank) ❌
- [ ] **Expected:** Should show plain markers when count is small

### Interaction
- [ ] Click marker → popup opens, card highlights in sidebar
- [ ] Click sidebar card → map centers, popup opens
- [ ] **Click empty map area:** Selection clears ✅ Expected
- [ ] Selected property shows in URL (shareable link)

### Filters + Language Test
1. Apply zone filter in Spanish
2. Switch to English
3. **Expected:** Filter still works
4. **Bug:** May break if using unstable zone values ❌

### Mobile
- [ ] Map usable on mobile
- [ ] Sidebar becomes bottom sheet or accessible
- [ ] Touch interactions work (pan, zoom, select)

### Console
- [ ] No errors
- [ ] No excessive re-renders (watch for performance warnings)

---

## 4. PROPERTY DETAIL (`/propiedad/:id`)

### Layout
- [ ] Property info displays
- [ ] Hero image gallery loads
- [ ] No layout shift
- [ ] Mobile: Gallery swipeable

### Mini-Map - Critical Check
- [ ] **Mini-map displays** ✅ Expected (recently implemented)
- [ ] Marker shows at correct coordinates
- [ ] If coordinates missing/invalid → graceful fallback (no crash)

### Images - Data Guards
- [ ] Gallery has images (not undefined)
- [ ] Click to expand images works
- [ ] Navigation arrows work
- [ ] No console errors about `images[0]` being undefined

### Property Info
- [ ] Title shows (fallback if language missing)
- [ ] Description shows
- [ ] Price formatted
- [ ] Status badge ("Available", "Sold", "Rented", "Pending" ❌ Not yet implemented)
- [ ] Features (bedrooms, bathrooms, area) display
- [ ] Amenities list shows

### Actions - Accessibility
- [ ] **Favorites button:** Has aria-label? ⚠️ Check
- [ ] **Share buttons:** Have aria-labels? ⚠️ Check
- [ ] Contact form button works
- [ ] Schedule visit button works

### Language Switch
- [ ] Switch language → title/description translate
- [ ] Status badge translates
- [ ] Amenities translate

### Console
- [ ] No errors about missing data
- [ ] No null reference errors

---

## 5. FAVORITES PAGE (`/favoritos`)

### Functionality
- [ ] Page loads (empty state or favorite properties)
- [ ] Add favorite from property card (heart icon)
- [ ] Heart icon fills when favorited
- [ ] Remove favorite from favorites page
- [ ] Favorites persist (localStorage + Supabase sync)

### Empty State
- [ ] No favorites → shows empty message
- [ ] "Browse properties" link works

### Language
- [ ] Page text translates
- [ ] Property cards translate

### Console
- [ ] No errors

---

## 6. ADMIN PANEL (`/admin`)

### Access
- [ ] Login required
- [ ] Role check works (only admins can access)
- [ ] Redirect to login if not authenticated

### Sidebar - i18n Check
- [ ] **Menu items:** Switch to English - ALL items translate ⚠️ Currently Spanish-only ❌
- [ ] **Expected translations:**
  - Dashboard → Dashboard
  - Propiedades → Properties
  - Zonas de Servicio → Service Zones
  - Visitas → Visits
  - Consultas → Inquiries
  - Usuarios → Users
  - Configuración → Settings
  - Salud del Sistema → System Health

### Properties CRUD
- [ ] List properties
- [ ] Create new property
- [ ] Edit existing property
- [ ] Delete property (with confirmation)

### Property Form - Data Validation
- [ ] **Coordinates:** Validates Oaxaca bounds (15.6-18.7 lat, -98.6 to -93.8 lng) ⚠️ Check
- [ ] Error message shows if out of bounds (bilingual)
- [ ] **Zone:** Dropdown shows active service zones
- [ ] **Type:** Includes all types (casa, departamento, local, oficina, **terrenos** ❌ Not yet added)
- [ ] **Status:** Shows options (disponible, vendida, rentada, **pendiente** ❌ Not yet added)
- [ ] **Images:** Requires at least one image
- [ ] **Price:** Required, numeric validation

### Image Upload
- [ ] Upload works
- [ ] Image optimization happens (WebP generation)
- [ ] Preview shows after upload
- [ ] Delete image works

### Console
- [ ] No errors
- [ ] No TypeScript warnings

---

## 7. ABOUT US PAGE (`/nosotros`)

### Content - Known Issue
- [ ] **Placeholder content:** Needs real text/images ❌ TODO
- [ ] Team section shows (currently placeholder)
- [ ] Company info shows

### Agent Platform - Not Yet Implemented
- [ ] Agent cards section (future: individual agent profiles)
- [ ] Agent subscription system (3000 MXN/month) ❌ Not implemented

---

## 8. CONTACT PAGE (`/contacto`)

### Form
- [ ] Name, email, phone, message fields
- [ ] Validation works (required fields)
- [ ] Submit button works
- [ ] Success message shows
- [ ] Form data saves to database

### Email - Known Issue
- [ ] **Email delivery:** contacto@yrinmobiliaria.com receives emails ⚠️ Needs setup
- [ ] **Email sending:** Cannot send emails yet ❌ Needs configuration

---

## 9. MOBILE RESPONSIVE (Viewport: 375px - 768px)

### General
- [ ] Navigation menu (hamburger) works
- [ ] All pages accessible
- [ ] No horizontal scroll
- [ ] Touch targets large enough (min 44px)

### Specific Pages
- [ ] **Homepage:** Hero fills screen, filters accessible
- [ ] **Properties:** Grid adapts (1-2 columns), filters in sheet/modal
- [ ] **Map:** Usable (pan, zoom, select), sidebar accessible
- [ ] **Property Detail:** Gallery swipeable, info readable

---

## 10. ACCESSIBILITY (A11y) - Target: 95/100

### Icon Buttons - Known Issue
- [ ] Map controls (fullscreen, location, reset view) have `aria-label` ⚠️ May be missing
- [ ] Favorites heart icon has `aria-label`
- [ ] Share buttons have `aria-label`
- [ ] Language switcher has `aria-label`

### Form Labels
- [ ] All inputs have associated `<label>` or `aria-label`
- [ ] Filter checkboxes have translated labels
- [ ] Select elements have labels

### Contrast - Known Issue
- [ ] `text-muted-foreground` has 4.5:1 contrast ⚠️ May fail
- [ ] Check with Lighthouse or axe DevTools

### Keyboard Navigation
- [ ] Tab through page → logical order
- [ ] Can navigate filters with keyboard
- [ ] Can select map markers with keyboard
- [ ] Escape key closes dialogs

---

## 11. PERFORMANCE

### Build Check
```bash
npm run build
```
- [ ] Build completes without errors
- [ ] Bundle size: ~810 KB (warning expected, acceptable)
- [ ] No TypeScript errors

### Lighthouse Audit (Chrome DevTools)
**Desktop:**
- [ ] Performance: ≥95
- [ ] Accessibility: ≥95 (currently ~83)
- [ ] Best Practices: 100
- [ ] SEO: 100

**Mobile:**
- [ ] Performance: ≥90 (currently ~80)
- [ ] LCP: <2.5s (currently ~5.0s ❌)
- [ ] Accessibility: ≥95 (currently ~83)

### Image Loading
- [ ] Hero images load quickly (AVIF preferred)
- [ ] Property cards lazy-load images
- [ ] No layout shift (CLS = 0)

---

## 12. CONSOLE ERROR SUMMARY

After testing all pages, review console for:
- [ ] No React errors
- [ ] No TypeScript warnings
- [ ] No 404s for assets
- [ ] No null reference errors
- [ ] No infinite re-render warnings

---

## KNOWN ISSUES SUMMARY (From Codex + Audit)

### Critical (Fix ASAP)
1. ❌ **Zone filter bug:** Uses language-specific values, breaks in English
2. ❌ **Hero price slider:** Single-handle (inconsistent with other pages)
3. ❌ **Property types missing:** "terrenos" (land) not in enum
4. ❌ **Property status missing:** "pendiente" (pending) not in enum

### Important (Fix Soon)
5. ❌ **Map clustering:** Always on, even for small datasets (adds jank)
6. ❌ **Hardcoded strings:** PropertyFilter types, AdminSidebar menu
7. ⚠️ **A11y gaps:** Icon buttons missing aria-labels, contrast issues
8. ⚠️ **Data guards:** Need null checks for images[0], location.zone

### Medium Priority
9. ❌ **About Us content:** Placeholder text/images
10. ❌ **Email setup:** contacto@yrinmobiliaria.com send/receive
11. ⚠️ **Price sliders:** Should be logarithmic (not linear)
12. ❌ **Homepage operation filter:** Missing buy/rent selector

### Future Features
13. ❌ **Multi-agent platform:** Subscription system, agent profiles, property ownership
14. ❌ **Agent pages:** Individual customizable pages for each agent

---

## TESTING SIGN-OFF

**Tester:** _______________
**Date:** _______________

**Overall Status:**
- [ ] All critical tests pass
- [ ] Known issues documented
- [ ] Ready for next Lovable prompt
- [ ] Ready for production (pending fixes)

---

## NEXT STEPS

Based on test results, prioritize Lovable prompts:

**Prompt Priority:**
1. Fix zone filter bug + add missing types/statuses (critical)
2. Logarithmic sliders + homepage operation filter (UX consistency)
3. A11y improvements + data guards (polish)
4. Agent platform architecture (strategic, multi-prompt effort)
