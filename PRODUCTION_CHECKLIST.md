# Production Readiness Checklist — YR Inmobiliaria

**Last Updated:** December 9, 2025

Use this checklist before going live. Keep docs lean (max 5 files) and stamp dates on edits.

---

## Quality Gates (Must Pass Before Launch)

- [ ] `npm run lint` — Zero ESLint errors
- [ ] `npm run build` — Passes without warnings
- [ ] `npm audit --audit-level=high` — Zero vulnerabilities
- [ ] Test coverage for critical paths (auth, favorites, admin)
- [ ] Bundle size reasonable (< 700 KB main chunk)
- [ ] Lighthouse scores maintained (Desktop 90+, Mobile 80+)

---

## Content Complete

### Company Information
- [ ] Company name and logo updated
- [ ] About page content filled out
- [ ] Contact information verified (phone, email, address)
- [ ] Social media links working
- [ ] Terms and conditions page reviewed
- [ ] Privacy policy page reviewed

### Property Data
- [ ] All properties have real data (not placeholders)
- [ ] Property images high quality and optimized
- [ ] Descriptions complete in both languages
- [ ] Prices accurate and current
- [ ] Location data correct
- [ ] Availability status up to date

### Translations
- [ ] All Spanish translations complete
- [ ] All English translations complete
- [ ] No missing translation keys
- [ ] Consistent terminology throughout

---

## Design & Responsiveness

### Responsive Testing
- [ ] Desktop (1920px, 1440px, 1280px)
- [ ] Tablet (1024px, 768px)
- [ ] Mobile (414px, 375px, 320px)

### Cross-Browser
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari
- [ ] Chrome Android

---

## Performance

### Metrics
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 90
- [ ] Lighthouse Best Practices > 90
- [ ] Lighthouse SEO > 90
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1

### Optimization
- [ ] Images optimized (WebP/AVIF)
- [ ] Lazy loading implemented
- [ ] Code splitting working
- [ ] No unused dependencies
- [ ] No console errors in production

---

## Security

- [ ] HTTPS enabled
- [ ] Environment variables set correctly
- [ ] No API keys in code
- [ ] CORS configured properly
- [ ] Input validation on all forms
- [ ] XSS protection implemented

---

## Accessibility (WCAG 2.1 Level AA)

- [ ] Proper heading hierarchy
- [ ] Semantic HTML elements
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] All images have alt text
- [ ] Sufficient color contrast (4.5:1)
- [ ] Form inputs have labels
- [ ] ARIA labels used appropriately

---

## SEO

- [ ] Sitemap.xml created
- [ ] Robots.txt configured
- [ ] Canonical URLs set
- [ ] Structured data (JSON-LD) added
- [ ] Unique title tags (< 60 chars)
- [ ] Unique meta descriptions (< 160 chars)
- [ ] Open Graph tags configured
- [ ] Twitter Card tags configured

---

## Functionality Testing

### Navigation
- [ ] All menu links work
- [ ] Logo links to home
- [ ] Mobile menu opens/closes
- [ ] Language switcher works
- [ ] Footer links work

### Features
- [ ] Property search and filters work
- [ ] Sorting properties works
- [ ] Map displays properly
- [ ] Contact forms submit successfully
- [ ] Schedule visit form works
- [ ] WhatsApp button opens correctly
- [ ] Favorites save and load

### Forms
- [ ] Validation works on all fields
- [ ] Error messages display properly
- [ ] Success messages show after submission
- [ ] Loading states during submission

---

## Integrations

### Email (Resend)
- [ ] Domain verified
- [ ] API key configured in Lovable Cloud
- [ ] Contact form emails working
- [ ] Visit scheduling emails working

### Analytics
- [ ] Google Analytics configured
- [ ] Tracking code added
- [ ] Real-time tracking verified

### WhatsApp
- [ ] Business phone configured
- [ ] Button working
- [ ] Messages open correctly

---

## Deployment

### Pre-Deploy
- [ ] Latest code committed
- [ ] Build completes without errors
- [ ] Production env vars set
- [ ] Rollback plan prepared

### Domain & Hosting
- [ ] Domain registered
- [ ] DNS configured
- [ ] SSL certificate active

### Post-Deploy
- [ ] Production site loads
- [ ] All pages accessible
- [ ] Forms working in production
- [ ] Analytics tracking
- [ ] No console errors

---

## Post-Launch Monitoring

- [ ] Uptime monitoring configured
- [ ] Error tracking set up
- [ ] Performance monitoring active
- [ ] Google Search Console configured
- [ ] SSL certificate expiry monitored

---

## Launch Day

- [ ] Site deployed to production
- [ ] DNS propagation complete
- [ ] Final testing on live site
- [ ] Analytics confirmed
- [ ] Launch announcement ready

---

**Status Legend:**
- ⬜ Not Started
- 🟡 In Progress
- ✅ Complete
- ❌ Blocked
