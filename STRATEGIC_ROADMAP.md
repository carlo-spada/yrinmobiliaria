# YR Inmobiliaria - Strategic Roadmap & Feature Planning

**Date:** November 20, 2025
**Status:** Production-ready baseline, planning growth features

---

## IMMEDIATE PRIORITIES (This Week)

### 1. Critical Bug Fixes (Lovable Prompt Required)

**Zone Filter Language Bug** - CRITICAL
- **Issue:** Zone filters use Spanish names as values, break when switching to English
- **Impact:** 0 results in English mode, breaks core functionality
- **Fix:** Use stable slugs/IDs as values, localized labels for display
- **Applies to:** Homepage, /propiedades, /mapa
- **Effort:** 1 prompt

**Missing Enums** - HIGH PRIORITY
- Add "terrenos" (land) to property types
- Add "pendiente" (pending) to property statuses
- **Why:** Needed for real-world property management
- **Effort:** Include in same prompt as zone fix

**Price Slider Consistency** - HIGH
- Homepage hero: upgrade single-handle → dual-handle
- Make all sliders logarithmic (better for wide price ranges)
- **Why:** UX consistency + better filtering for MXN ranges (500k - 10M)
- **Effort:** Include in same prompt

**Homepage Operation Filter** - HIGH
- Add buy/rent toggle to hero section
- Currently only shows tipo de propiedad + zone
- **Why:** Core functionality gap
- **Effort:** Include in same prompt

---

### 2. What Can Be Done WITHOUT Lovable

#### Content Updates ✅ (Can do now)
- **About Us page:** Write real company story, mission, values
- **Team photos:** Replace placeholders with real photos
- **Property descriptions:** Improve/verify existing listings

#### Planning & Design ✅ (Can do now)
- **Agent platform architecture:** Design database schema, UX flows
- **Email setup research:** Evaluate options (see section below)
- **Pricing model:** Define agent subscription tiers, features

#### Local Development ✅ (Can do now)
- **Testing:** Run through TESTING_MANUAL.md checklist
- **Documentation:** Update guides, create agent onboarding docs
- **Asset preparation:** Optimize images, create design assets

#### What CANNOT Be Done Locally ❌
- Any code changes (filters, sliders, new features)
- Database schema changes (adding columns, enums)
- Backend configuration (email, auth, RLS policies)
- **Requires Lovable prompts**

---

## SHORT-TERM FEATURES (Next 2-4 Weeks)

### 3. Email Setup for contacto@yrinmobiliaria.com

**Current State:** Contact form saves to database, but no email delivery

**Options:**

#### Option A: Custom Domain Email (Recommended)
**Providers:**
- **Google Workspace** ($6 USD/month) - Professional, reliable
- **Microsoft 365** ($5 USD/month) - Alternative
- **Zoho Mail** ($1 USD/month) - Budget option

**Setup:**
1. Purchase domain email service
2. Configure DNS records (MX, SPF, DKIM)
3. Use SMTP credentials in Supabase Edge Function
4. Lovable prompt: "Add email sending to contact form submissions"

**Pros:** Full control, can send/receive, professional
**Cons:** Monthly cost, requires DNS setup

#### Option B: Supabase + Resend/SendGrid
**Free tiers available:**
- **Resend:** 100 emails/day free
- **SendGrid:** 100 emails/day free

**Setup:**
1. Sign up for Resend or SendGrid
2. Verify domain (add DNS records)
3. Get API key
4. Lovable prompt: "Integrate Resend API for contact form emails"

**Pros:** Free tier sufficient for starting out
**Cons:** Only sends (receiving requires domain email)

#### Recommendation
Start with **Option B** (Resend) for outbound emails, add **Option A** later when you need full inbox management.

**Action Items (Can start now):**
- [ ] Sign up for Resend.com
- [ ] Add DNS records to verify domain
- [ ] Get API key (save securely)
- [ ] Draft Lovable prompt for email integration

---

### 4. Accessibility Improvements

**Target:** Lighthouse A11y 83 → 95+

**Fixes Needed (Lovable Prompt):**
- Add aria-labels to icon-only buttons
- Fix contrast ratios on muted text
- Ensure all form inputs have labels
- Translate filter checkbox labels

**Effort:** 1 prompt (can bundle with bug fixes)

---

## MEDIUM-TERM FEATURES (1-3 Months)

### 5. Multi-Agent Platform - Architecture Design

**Vision:** Allow real estate agents to pay 3,000 MXN/month to:
- Upload/manage their own properties
- Create customizable agent profile page
- Appear in "About Us" team section
- Track their listings and leads

#### Database Schema (New Tables)

**`agents` table:**
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users) -- Links to Supabase auth
- name_es, name_en (TEXT)
- bio_es, bio_en (TEXT)
- photo_url (TEXT)
- specialties (TEXT[]) -- e.g., ['residential', 'commercial']
- experience_years (INT)
- phone (TEXT)
- email (TEXT)
- social_links (JSONB) -- {facebook, instagram, linkedin, whatsapp}
- custom_page_settings (JSONB) -- {banner_color, featured_properties_ids, etc.}
- status (ENUM: 'active', 'suspended', 'pending')
- created_at, updated_at
```

**`agent_subscriptions` table:**
```sql
- id (UUID, PK)
- agent_id (UUID, FK → agents.id)
- plan_type (TEXT) -- 'monthly_3000'
- status (ENUM: 'active', 'cancelled', 'past_due')
- current_period_start (DATE)
- current_period_end (DATE)
- payment_method (TEXT) -- 'stripe', 'manual', etc.
- created_at, updated_at
```

**Update `properties` table:**
```sql
ALTER TABLE properties ADD COLUMN agent_id UUID REFERENCES agents(id);
-- NULL = YR Inmobiliaria owned, non-NULL = agent owned
```

#### User Roles (Supabase Auth)

**Current:**
- `admin` - YR Inmobiliaria staff (full access)
- `public` - Website visitors (read-only)

**New:**
- `agent` - Subscribed agents (can CRUD own properties only)

**RLS Policies Needed:**
```sql
-- Agents can only see/edit their own properties
CREATE POLICY "Agents manage own properties"
  ON properties
  FOR ALL
  TO authenticated
  USING (agent_id = auth.uid() OR auth.uid() IN (SELECT id FROM admins));
```

#### Agent Profile Pages

**Routes:**
- `/agentes` - List all active agents (gallery view)
- `/agentes/[agent-id]` - Individual agent page

**Agent Page Sections:**
- Hero banner (customizable color/image)
- Profile photo + bio
- Experience highlights
- Specialties badges
- Featured properties (agent selects top 3-5)
- All agent's properties (filterable)
- Contact form (goes to agent's email)
- Social media links

**Customization Options:**
- Banner color/image
- Featured properties selection
- Bio text (ES/EN)
- Specialty tags
- Social links

#### Payment Integration

**Options:**
1. **Stripe** (Recommended)
   - Recurring subscriptions built-in
   - 3.6% + 3 MXN per transaction
   - Auto-handles failed payments

2. **Manual (Bank Transfer)**
   - Agent pays via bank transfer
   - Admin manually marks subscription active
   - More work, but no fees

**Recommendation:** Start with manual, add Stripe when you have 5+ agents

#### Agent Onboarding Flow

1. Agent fills application form (name, email, phone, experience)
2. Admin reviews application in `/admin/agents`
3. Admin approves → Agent receives invite email
4. Agent creates account (Supabase auth)
5. Agent sets up profile (bio, photo, social links)
6. Agent pays first month (manual transfer or Stripe)
7. Admin activates subscription → Agent role granted
8. Agent can now upload properties, customize page

#### Implementation Plan (Multiple Lovable Prompts)

**Prompt 1: Database + Auth**
- Create `agents` and `agent_subscriptions` tables
- Add `agent_id` column to `properties`
- Create `agent` role and RLS policies
- Agent application form (public-facing)

**Prompt 2: Admin Agent Management**
- `/admin/agents` page (list, approve, suspend)
- `/admin/agents/[id]` detail view
- Subscription management (activate, cancel, view history)
- Invite agent flow (send email with signup link)

**Prompt 3: Agent Dashboard**
- `/agente/dashboard` (agent-only route)
- My properties list
- Upload new property (limited to own properties)
- Edit/delete own properties
- Profile settings

**Prompt 4: Agent Public Pages**
- `/agentes` - Agent directory
- `/agentes/[id]` - Individual agent page
- Agent card component for About Us
- Agent property filtering

**Effort:** 4 prompts, 1-2 weeks of Lovable work

---

### 6. Content & SEO Improvements

**About Us Page Rewrite (Can do now):**
- Replace placeholder with real company story
- Add real team photos
- Include agent cards (once agent platform live)
- Add testimonials section

**Blog/Resources (Future):**
- Market insights for Oaxaca real estate
- Guides for buyers/sellers
- Neighborhood spotlights
- SEO benefits

---

## LONG-TERM VISION (3-6 Months)

### 7. Advanced Features

**Lead Management CRM:**
- Track inquiries and scheduled visits
- Agent assignment (route leads to specific agents)
- Follow-up reminders
- Conversion tracking

**Advanced Search:**
- Map boundary search (draw area)
- Saved searches (email alerts for new properties)
- Similar properties recommendation
- Virtual tours (360° photos)

**Analytics Dashboard:**
- Property views, inquiries, conversions
- Agent performance metrics
- Revenue tracking (subscription MRR)
- Market trends

---

## COST ANALYSIS: Multi-Agent Platform

### Revenue Model
- **Agent subscription:** 3,000 MXN/month per agent
- **Target:** 10 agents in 6 months
- **Projected MRR:** 30,000 MXN (~$1,800 USD)

### Costs
- **Lovable subscription:** ~$20 USD/month (current)
- **Supabase:** Free tier sufficient for <100 agents
- **Domain email:** $6 USD/month
- **Stripe fees:** 3.6% of revenue (~$65 USD/month at 10 agents)
- **Total monthly costs:** ~$91 USD

### Profit (at 10 agents)
- **Revenue:** $1,800 USD/month
- **Costs:** $91 USD/month
- **Profit:** $1,709 USD/month (95% margin)

**Break-even:** 2 agents

---

## IMPLEMENTATION TIMELINE

### Week 1 (Now)
- [ ] Create testing checklist (done ✓)
- [ ] Run manual testing (you do this)
- [ ] Draft critical bug fix prompt (zone filter, enums, sliders)
- [ ] Sign up for Resend (email setup)

### Week 2
- [ ] Submit bug fix prompt to Lovable
- [ ] Write About Us content
- [ ] Design agent platform UX (wireframes)
- [ ] Define agent subscription tiers

### Week 3-4
- [ ] Submit email integration prompt
- [ ] Submit agent platform Prompt 1 (database + auth)
- [ ] Begin agent outreach (gauge interest)

### Month 2
- [ ] Submit agent platform Prompts 2-4
- [ ] Beta test with 1-2 agents
- [ ] Refine agent onboarding flow

### Month 3
- [ ] Launch agent platform publicly
- [ ] Onboard first 5 agents
- [ ] Iterate based on feedback

---

## QUESTIONS & DECISIONS NEEDED

### 1. Agent Subscription Details
- **Pricing:** 3,000 MXN/month confirmed?
- **Trial period:** Offer 1 month free trial?
- **Property limit:** Unlimited properties or cap (e.g., 20 max)?
- **Commission:** Do agents keep 100% of their sales, or does YR take a cut?

### 2. Agent Approval Process
- **Auto-approve:** Anyone can sign up and pay?
- **Manual review:** Admin approves each agent?
- **Requirements:** License verification, experience minimums?

### 3. Property Ownership
- **Agent leaves:** What happens to their properties?
  - Option A: Properties stay on platform (YR takes over)
  - Option B: Properties removed (agent owns data)

### 4. Email Strategy
- **Start with Resend (free tier)?** Or go straight to Google Workspace?
- **Email addresses:**
  - contacto@yrinmobiliaria.com (general inquiries)
  - agentes@yrinmobiliaria.com (agent support)
  - Individual agent emails? (e.g., juan@yrinmobiliaria.com)

---

## RECOMMENDED NEXT ACTIONS

### Immediate (Can Do Now - No Lovable)
1. ✅ **Run testing checklist** - Use TESTING_MANUAL.md
2. ✅ **Write About Us content** - Real story, mission, team bios
3. ✅ **Sign up for Resend** - Verify domain, get API key
4. ✅ **Design agent platform** - Sketch UX flows, database schema
5. ✅ **Answer decision questions** - Agent pricing, approval process, etc.

### Next Lovable Prompt (Submit Today/Tomorrow)
**Title:** "Critical Fixes: Zone Filter Bug + Missing Enums + Slider Improvements"

**Include:**
- Fix zone filter (stable values, localized labels)
- Add "terrenos" property type
- Add "pendiente" property status
- Logarithmic price sliders (all pages)
- Dual-handle slider on homepage
- Homepage operation filter (buy/rent)

**Estimated Effort:** 1 comprehensive prompt

### Following Prompts (Sequential)
1. Email integration (Resend API)
2. A11y improvements
3. Agent platform (4-part series)

---

## YOUR QUESTIONS ANSWERED

> "Can we start doing some of these without waiting for Lovable?"

**Yes!** You can do:
- Testing (run through TESTING_MANUAL.md)
- Content (About Us rewrite, property descriptions)
- Planning (agent platform design, wireframes)
- Email research (sign up for Resend, get API key)
- Documentation (agent onboarding guides)

**You cannot do:**
- Code changes (all require Lovable prompts)
- Database changes (tables, enums, RLS)
- Feature implementations

> "What about the multi-agent platform?"

**Great idea, well thought-out.** Key points:
- 3,000 MXN/month is reasonable (competitive in Mexico)
- Agent pages + customization is a strong value prop
- Start with manual payments, add Stripe later
- Needs 4 Lovable prompts (~1-2 weeks of work)
- Break-even at 2 agents, profitable at 3+

> "Email setup for contacto@yrinmobiliaria.com?"

**Two-phase approach:**
1. **Now:** Resend.com (free tier) for outbound emails
2. **Later:** Google Workspace ($6/mo) for full inbox

**Action:** Sign up for Resend, verify domain, save API key

---

**Ready to proceed?** Let me know:
1. Should I draft the critical bug fix prompt?
2. Any decisions needed on agent platform questions?
3. Want help with About Us content rewrite?
