# 🚀 Deployment Guide - YR Inmobiliaria

Complete guide for deploying YR Inmobiliaria to production.

## 📋 Pre-Deployment Checklist

### 1. Content & Configuration

- [ ] Update company information in Footer
- [ ] Replace placeholder images with real property photos
- [ ] Update WhatsApp number in `.env`
- [ ] Configure EmailJS for contact forms
- [ ] Add Google Analytics tracking ID
- [ ] Update property data in `src/data/properties.ts`
- [ ] Verify all translations are complete and accurate
- [ ] Update meta tags and favicons

### 2. Testing

#### Responsive Testing
- [ ] Mobile (320px - iPhone SE)
- [ ] Mobile (375px - iPhone 12/13)
- [ ] Mobile (414px - iPhone Plus)
- [ ] Tablet (768px - iPad)
- [ ] Tablet (1024px - iPad Pro)
- [ ] Desktop (1280px - Standard)
- [ ] Desktop (1440px - Common)
- [ ] Desktop (1920px - Full HD)

#### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

#### Functionality Testing
- [ ] All navigation links work
- [ ] Property filters function correctly
- [ ] Search and sorting work
- [ ] Forms submit successfully
- [ ] Favorites save/load correctly
- [ ] Language switching works
- [ ] Map displays properly
- [ ] WhatsApp button opens correctly
- [ ] Share buttons work
- [ ] Images load and display
- [ ] Animations run smoothly

### 3. Performance

- [ ] Run Lighthouse audit (target: 90+ on all metrics)
- [ ] Optimize images (WebP format, proper sizing)
- [ ] Check bundle size (`npm run build`)
- [ ] Verify no console errors
- [ ] Test loading on slow 3G network
- [ ] Check Core Web Vitals

### 4. SEO

- [ ] Verify meta descriptions on all pages
- [ ] Check Open Graph tags
- [ ] Update `robots.txt`
- [ ] Create `sitemap.xml`
- [ ] Submit sitemap to Google Search Console
- [ ] Verify canonical URLs
- [ ] Check structured data (JSON-LD)

### 5. Accessibility

- [ ] All images have alt text
- [ ] Forms have proper labels
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] ARIA labels present

### 6. Security

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] No API keys in client code
- [ ] Form validation implemented
- [ ] XSS protection verified
- [ ] CORS configured correctly

## 🌐 Deployment Options

### Option 1: Lovable (Easiest - Recommended)

**Pros:** Instant deployment, automatic HTTPS, zero config, integrated with editor

**Steps:**
1. Click "Publish" button in Lovable
2. Choose a subdomain or connect custom domain
3. Click "Update" to deploy changes

**Custom Domain:**
1. Go to Project > Settings > Domains
2. Add your domain
3. Update DNS records:
   ```
   Type: CNAME
   Name: www (or @)
   Value: [provided by Lovable]
   ```

**Cost:** Free tier available, paid plans for custom domains

---

### Option 2: Vercel (Very Easy)

**Pros:** Excellent performance, automatic deployments, serverless functions

**Steps:**

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. For production:
```bash
vercel --prod
```

**Custom Domain:**
```bash
vercel domains add your-domain.com
```

**Environment Variables:**
```bash
# Add via Vercel dashboard or CLI
vercel env add VITE_EMAILJS_SERVICE_ID
vercel env add VITE_GA_MEASUREMENT_ID
```

**Cost:** Free for personal projects

---

### Option 3: Netlify

**Pros:** Simple deployment, great free tier, form handling

**Steps:**

1. Build the project:
```bash
npm run build
```

2. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

3. Login:
```bash
netlify login
```

4. Deploy:
```bash
netlify deploy --prod
```

**Or via Git:**
1. Push code to GitHub
2. Connect repository in Netlify dashboard
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

**Environment Variables:**
Add in Site Settings > Build & Deploy > Environment

**Cost:** Free tier available

---

### Option 4: Cloudflare Pages

**Pros:** Fast CDN, unlimited bandwidth on free tier

**Steps:**

1. Push code to GitHub
2. Connect repository in Cloudflare Pages dashboard
3. Configure:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/`

**Environment Variables:**
Settings > Environment variables

**Cost:** Free

---

### Option 5: AWS S3 + CloudFront

**Pros:** Enterprise-grade, scalable, complete control

**Steps:**

1. Build the project:
```bash
npm run build
```

2. Create S3 bucket:
```bash
aws s3 mb s3://yr-inmobiliaria
```

3. Enable static website hosting:
```bash
aws s3 website s3://yr-inmobiliaria --index-document index.html --error-document index.html
```

4. Upload files:
```bash
aws s3 sync dist/ s3://yr-inmobiliaria --acl public-read
```

5. Create CloudFront distribution for HTTPS and caching

**Cost:** Pay per usage (very cheap for small sites)

---

### Option 6: GitHub Pages

**Pros:** Free hosting, integrated with GitHub

**Steps:**

1. Install gh-pages:
```bash
npm install -D gh-pages
```

2. Add to `package.json`:
```json
{
  "homepage": "https://yourusername.github.io/yr-inmobiliaria",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Deploy:
```bash
npm run deploy
```

**Note:** May need to configure routing for SPA

**Cost:** Free

---

## 🔧 Post-Deployment Tasks

### 1. DNS Configuration (Custom Domain)

**A Records:**
```
Type: A
Name: @
Value: [Your hosting provider's IP]
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: your-domain.com
```

### 2. SSL Certificate

Most modern hosting platforms provide automatic SSL:
- Lovable: Automatic
- Vercel: Automatic
- Netlify: Automatic
- Cloudflare: Automatic

### 3. Google Search Console

1. Visit [Google Search Console](https://search.google.com/search-console)
2. Add your property
3. Verify ownership
4. Submit sitemap: `https://your-domain.com/sitemap.xml`

### 4. Google Analytics

1. Create GA4 property
2. Get Measurement ID
3. Add to environment variables
4. Redeploy with new variables

### 5. Monitoring

**Uptime Monitoring:**
- [UptimeRobot](https://uptimerobot.com/) (Free)
- [Pingdom](https://www.pingdom.com/)

**Error Tracking:**
- [Sentry](https://sentry.io/) (Free tier available)

**Performance:**
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)

## 🔄 Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_EMAILJS_SERVICE_ID: ${{ secrets.EMAILJS_SERVICE_ID }}
        VITE_GA_MEASUREMENT_ID: ${{ secrets.GA_MEASUREMENT_ID }}
        
    - name: Deploy
      run: npm run deploy
```

## 📊 Performance Optimization

### Image Optimization

```bash
# Install sharp for image optimization
npm install -D sharp

# Create optimization script
node scripts/optimize-images.js
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run build -- --report
```

### Caching Strategy

Configure headers for static assets:

**Vercel** (`vercel.json`):
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Netlify** (`netlify.toml`):
```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## 🆘 Troubleshooting

### Issue: Blank page after deployment
**Solution:** Check browser console for errors, verify build completed successfully

### Issue: 404 on page refresh
**Solution:** Configure hosting for SPA routing (redirect all routes to index.html)

### Issue: Environment variables not working
**Solution:** Ensure variables are prefixed with `VITE_` and properly configured in hosting platform

### Issue: Slow initial load
**Solution:** Optimize images, enable compression, use CDN

### Issue: Forms not sending
**Solution:** Verify EmailJS credentials, check CORS settings

## 📞 Support Resources

- **Lovable Documentation:** https://docs.lovable.dev
- **Vercel Documentation:** https://vercel.com/docs
- **Netlify Documentation:** https://docs.netlify.com
- **React Router:** https://reactrouter.com
- **Vite:** https://vitejs.dev

---

**Questions?** Open an issue or contact support.
