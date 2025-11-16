# Manual Testing Checklist

## Pre-Testing Setup
- [ ] Ensure `.env` file is configured with all required variables
- [ ] Verify Supabase connection is healthy (check `/admin/health`)
- [ ] Test with both authenticated and guest users
- [ ] Test in both Spanish and English languages
- [ ] Test on desktop and mobile viewports

---

## 🏠 Public Pages

### Home Page (`/`)
- [ ] Hero section loads with image
- [ ] Language toggle works (ES/EN)
- [ ] Featured properties display correctly
- [ ] Statistics section shows numbers
- [ ] Zones section displays all service areas
- [ ] Why Choose Us section renders
- [ ] Footer links work
- [ ] WhatsApp button appears and links correctly

### Properties Page (`/propiedades`)
- [ ] All properties load from database
- [ ] Filters work (type, operation, price range, zone)
- [ ] Search by title/description works
- [ ] Sort options function correctly
- [ ] Property cards display images, price, location
- [ ] Pagination works if many properties
- [ ] Grid/list view toggle works (if implemented)
- [ ] Favorite button works (saves to localStorage for guests)

### Property Detail Page (`/propiedad/:id`)
- [ ] Property details load correctly
- [ ] Image gallery works (navigation, fullscreen)
- [ ] Property features display
- [ ] Map shows correct location
- [ ] Contact form works
- [ ] Schedule visit button navigates correctly
- [ ] Share buttons work (copy link, social media)
- [ ] Similar properties section displays
- [ ] Favorite button works

### Map View (`/mapa`)
- [ ] Map loads with all property markers
- [ ] Markers cluster correctly when zoomed out
- [ ] Clicking marker shows property popup
- [ ] Popup links to property detail page
- [ ] Map controls work (zoom, pan)
- [ ] Property filters work with map
- [ ] Mobile: map is usable on small screens

### Contact Page (`/contacto`)
- [ ] Form validation works (required fields)
- [ ] Email format validation
- [ ] Phone number validation
- [ ] Subject dropdown works
- [ ] Form submission saves to `contact_inquiries` table
- [ ] Email is sent via EmailJS (if configured)
- [ ] Success message displays
- [ ] Form resets after submission
- [ ] Contact information displays correctly

### Schedule Visit Page (`/agendar`)
- [ ] Property selection dropdown works
- [ ] Date picker works (future dates only)
- [ ] Time slot selection works
- [ ] Form validation (all required fields)
- [ ] Submission saves to `scheduled_visits` table
- [ ] Email confirmation sent (if configured)
- [ ] Success animation displays
- [ ] Progress steps show correctly

### About Page (`/nosotros`)
- [ ] Content displays in both languages
- [ ] Images load
- [ ] Team section displays (if implemented)
- [ ] Values/mission section renders

### Favorites Page (`/favoritos`)
- [ ] **Guest users**: Favorites load from localStorage
- [ ] **Authenticated users**: Favorites load from database
- [ ] Property cards display correctly
- [ ] Remove favorite button works
- [ ] "Clear all" button works
- [ ] Empty state shows when no favorites
- [ ] Navigation to property detail works

### Privacy Policy (`/privacidad`)
- [ ] Full content displays
- [ ] Bilingual content switches correctly
- [ ] All sections render
- [ ] Links to contact information work

### Terms of Service (`/terminos`)
- [ ] Full content displays
- [ ] Bilingual content switches correctly
- [ ] All sections render
- [ ] Legal disclaimers present

---

## 🔐 Authentication

### Auth Page (`/auth`)
- [ ] Sign up form displays
- [ ] Email validation works
- [ ] Password strength indicator works
- [ ] Password confirmation validation
- [ ] Sign up creates user account
- [ ] Email confirmation flow works (if enabled)
- [ ] Login form displays
- [ ] Login with valid credentials works
- [ ] Login with invalid credentials shows error
- [ ] Redirect to home page after successful auth
- [ ] Error messages are user-friendly

### User Session
- [ ] Session persists on page refresh
- [ ] Logout button works
- [ ] Favorites migrate from localStorage to database on login
- [ ] Protected routes redirect to auth when not logged in

---

## 🔧 Admin Panel

### Admin Authentication
- [ ] Only admin users can access `/admin` routes
- [ ] Non-admin users redirected to home
- [ ] Guest users redirected to login

### Admin Dashboard (`/admin`)
- [ ] Statistics cards display correct counts
- [ ] Recent inquiries list displays
- [ ] Upcoming visits list displays
- [ ] All data loads from database
- [ ] Navigation sidebar works
- [ ] Header shows user info and logout

### Admin Properties (`/admin/properties`)
- [ ] Properties table loads all properties
- [ ] Search/filter works
- [ ] Add property button opens form dialog
- [ ] Add property form:
  - [ ] All fields validate
  - [ ] Image upload works (multiple images)
  - [ ] Location coordinates can be set
  - [ ] Amenities checkboxes work
  - [ ] Bilingual fields (ES/EN)
  - [ ] Save creates property in database
- [ ] Edit property works
- [ ] Delete property works (with confirmation)
- [ ] Property images display in table

### Admin Zones (`/admin/zones`)
- [ ] Zones table displays all service zones
- [ ] Add zone works (ES/EN names)
- [ ] Edit zone works
- [ ] Delete zone works
- [ ] Active/inactive toggle works
- [ ] Display order can be changed

### Admin Inquiries (`/admin/inquiries`)
- [ ] All contact inquiries display
- [ ] Status can be updated
- [ ] Filtering by status works
- [ ] Property name displays (if linked)
- [ ] Contact information displays
- [ ] Delete inquiry works
- [ ] Export functionality (if implemented)

### Admin Visits (`/admin/visits`)
- [ ] All scheduled visits display
- [ ] Status can be updated (pending/confirmed/cancelled)
- [ ] Filtering works
- [ ] Property details show
- [ ] Contact information accessible
- [ ] Date/time display correctly
- [ ] Delete visit works

### Admin Users (`/admin/users`)
- [ ] All users display
- [ ] User roles show correctly
- [ ] Promote to admin function works (restricted to admins)
- [ ] User email displays
- [ ] Filter by role works
- [ ] User count is accurate

### Admin Audit Logs (`/admin/audit-logs`)
- [ ] All audit logs display
- [ ] Logs show action, user, timestamp
- [ ] Filtering by action type works
- [ ] Filtering by table works
- [ ] Changes JSON displays properly
- [ ] Pagination works for large datasets

### Admin Health Check (`/admin/health`)
- [ ] All 5 service checks run:
  - [ ] Database connection
  - [ ] Authentication service
  - [ ] Row Level Security
  - [ ] Storage service
  - [ ] Realtime service
- [ ] Status badges display correctly (healthy/degraded/unhealthy)
- [ ] Response times show
- [ ] Refresh button works
- [ ] Auto-refresh every 30 seconds
- [ ] Error details display when services fail

### Admin Settings (`/admin/settings`)
- [ ] Settings display
- [ ] Configuration can be updated
- [ ] Changes save successfully

### Database Seed (`/admin/seed`) **⚠️ PROTECTED ROUTE**
- [ ] Requires admin authentication
- [ ] Seed database button works
- [ ] Progress indicator shows
- [ ] Success message displays
- [ ] Properties created in database
- [ ] Clear database button works (with confirmation)
- [ ] Warning alert displays

---

## 🧪 Data Persistence Tests

### Favorites System
- [ ] **Guest**: Favorites persist in localStorage across sessions
- [ ] **Guest**: Favorites visible in favorites page
- [ ] **Authenticated**: Favorites save to `user_favorites` table
- [ ] **Authenticated**: Favorites load from database
- [ ] **Migration**: localStorage favorites sync to database on login
- [ ] **Realtime** (if implemented): Favorites sync across devices

### Contact Inquiries
- [ ] Submissions save to `contact_inquiries` table
- [ ] All form fields persist correctly
- [ ] Status defaults to "new"
- [ ] Timestamp records correctly

### Scheduled Visits
- [ ] Bookings save to `scheduled_visits` table
- [ ] Property reference saves correctly
- [ ] Date/time persist in correct format
- [ ] Status defaults to "pending"

---

## 🔒 Security Tests

### Row Level Security (RLS)
- [ ] Users can only view their own favorites
- [ ] Users can only view their own roles
- [ ] Admins can view all inquiries
- [ ] Admins can view all scheduled visits
- [ ] Admins can manage properties
- [ ] Public properties viewable by everyone
- [ ] Admin-only tables blocked for regular users

### Input Validation
- [ ] XSS protection (special characters handled)
- [ ] SQL injection protection (parameterized queries)
- [ ] Email format validated
- [ ] Phone number format validated
- [ ] Required fields enforced
- [ ] Max length enforced on text inputs
- [ ] File upload size limits enforced

### Authentication Security
- [ ] Password strength requirements enforced
- [ ] Session expires appropriately
- [ ] Logout clears session
- [ ] Admin routes protected
- [ ] API endpoints validate auth tokens

---

## 📱 Responsive Design

### Mobile (320px - 768px)
- [ ] Navigation menu collapses to hamburger
- [ ] All forms usable on small screens
- [ ] Images scale appropriately
- [ ] Text remains readable
- [ ] Buttons are large enough to tap
- [ ] Property cards stack vertically
- [ ] Admin panel sidebar collapses

### Tablet (768px - 1024px)
- [ ] Layout adjusts appropriately
- [ ] Property grid shows 2 columns
- [ ] Admin panel layout responsive

### Desktop (1024px+)
- [ ] Full layout displays
- [ ] Property grid shows 3-4 columns
- [ ] Admin sidebar stays visible

---

## 🌐 Internationalization (i18n)

### Language Switching
- [ ] Language toggle in header works
- [ ] Language preference persists
- [ ] All text content switches language
- [ ] Property titles/descriptions switch
- [ ] Form labels switch
- [ ] Error messages switch
- [ ] Success messages switch

### Content Coverage
- [ ] All pages have translations
- [ ] No missing translation keys
- [ ] Date/time formats localized
- [ ] Currency formats correct

---

## ⚡ Performance

### Page Load Times
- [ ] Home page loads < 3 seconds
- [ ] Properties page loads < 3 seconds
- [ ] Property detail loads < 2 seconds
- [ ] Admin pages load < 3 seconds

### Image Optimization
- [ ] Images use WebP format where possible
- [ ] Images lazy load
- [ ] Thumbnails load before full images
- [ ] No layout shift from images loading

### Database Queries
- [ ] Admin health check shows response times < 1000ms
- [ ] Properties load quickly (check with many records)
- [ ] Favorites load quickly

---

## 🐛 Error Handling

### Network Errors
- [ ] Lost connection shows user-friendly message
- [ ] Failed API calls show error toast
- [ ] Retry mechanism works (where implemented)

### Form Errors
- [ ] Validation errors display clearly
- [ ] Error messages are specific and helpful
- [ ] Field-level errors highlight problem fields
- [ ] Form doesn't submit with errors

### 404 Handling
- [ ] Invalid routes show 404 page
- [ ] 404 page has link back to home
- [ ] Invalid property IDs handled gracefully

### Supabase Errors
- [ ] Missing env vars show clear error UI
- [ ] RLS policy violations handled gracefully
- [ ] Database connection issues handled

---

## 🔍 SEO & Analytics

### SEO (if implemented)
- [ ] Meta titles present on all pages
- [ ] Meta descriptions present
- [ ] Open Graph tags for social sharing
- [ ] Canonical URLs set
- [ ] Robots.txt configured
- [ ] Sitemap.xml present

### Google Analytics (if configured)
- [ ] GA4 initializes when env var present
- [ ] Page views tracked
- [ ] Event tracking works:
  - [ ] Property views
  - [ ] Contact form submissions
  - [ ] Visit scheduling
  - [ ] Favorites added/removed
  - [ ] Search queries

---

## 🚀 Deployment Checks

### Environment Variables
- [ ] All required env vars documented in `.env.example`
- [ ] Production env vars configured
- [ ] Supabase URLs correct for production
- [ ] EmailJS keys configured (if using)
- [ ] GA measurement ID set (if using)

### Build Process
- [ ] `npm run build` completes without errors
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Build size is reasonable (< 2MB)

### Production Testing
- [ ] Deployed site accessible
- [ ] SSL certificate valid
- [ ] All API endpoints work in production
- [ ] Supabase connection works
- [ ] Image uploads work (check Storage permissions)
- [ ] Email sending works (if configured)

---

## ✅ Smoke Test (Quick Verification)

**Run these critical paths after any major change:**

1. **Guest User Journey**:
   - [ ] Visit home page
   - [ ] Browse properties
   - [ ] View property detail
   - [ ] Add to favorites
   - [ ] Submit contact form
   - [ ] Schedule a visit

2. **Authenticated User Journey**:
   - [ ] Sign up / Login
   - [ ] Browse properties
   - [ ] Add to favorites (syncs to DB)
   - [ ] View favorites page
   - [ ] Logout

3. **Admin Journey**:
   - [ ] Login as admin
   - [ ] View dashboard
   - [ ] Check system health
   - [ ] Add a new property
   - [ ] View inquiries
   - [ ] Update visit status

---

## 📝 Test Report Template

### Test Session Info
- **Date**: [YYYY-MM-DD]
- **Tester**: [Name]
- **Browser**: [Chrome/Firefox/Safari + Version]
- **Device**: [Desktop/Mobile/Tablet + OS]
- **Build**: [Commit hash or version]

### Issues Found
| # | Page/Feature | Severity | Description | Steps to Reproduce |
|---|-------------|----------|-------------|-------------------|
| 1 | | High/Med/Low | | |
| 2 | | High/Med/Low | | |

### Notes
- [ ] All critical features working
- [ ] Performance acceptable
- [ ] UX is intuitive
- [ ] Ready for production: YES / NO

---

## 🎯 Automated Testing (Future Enhancement)

Consider adding:
- [ ] Unit tests for utility functions
- [ ] Integration tests for API calls
- [ ] E2E tests with Playwright/Cypress
- [ ] Visual regression testing
- [ ] Performance testing with Lighthouse
