# 🎯 YR Inmobiliaria - Project Intelligence Brief

> **Philosophy**: We're here to craft insanely great code directly in this repo. Use Lovable strategically for UI design and backend changes we can't handle directly.

**Last Updated:** November 20, 2025 (Development Model Updated - Direct Coding First!)

---

## ⚡ CRITICAL CONSTRAINTS

### 0. Documentation Discipline: LESS IS MORE
**Maximum 5 documentation files. Maximum 20,000 words each. Keep it lean.**

**Documentation Rules:**
- ✅ Every doc MUST have "Last Updated: [date]" at the top
- ✅ Update this date EVERY time you modify the file
- ✅ Synthesize and consolidate - never create new docs without deleting old ones
- ✅ If you can't fit it in 5 docs × 20k words, it doesn't belong
- ❌ NEVER create temporary docs, reports, or guides
- ❌ NEVER let documentation proliferate beyond 5 files

**Current Essential Docs:**
1. **README.md** - Project overview, status, quick start
2. **CLAUDE.md** - This file - workflow and strategic planning (you're reading it)
3. **AGENTS.md** - Guidelines for Codex/other agents

**Slots remaining:** 2 files (use wisely, delete when done)

## ⚡ CRITICAL CONSTRAINTS

### 1. Development Model: Direct Coding First
**Code changes that CAN be made directly in this repo SHOULD be made here. Use Lovable ONLY for what we can't handle ourselves.**

**Handle DIRECTLY in this repo (via Claude Code):**
- ✅ Bug fixes and code refactoring
- ✅ Type safety improvements (fixing `any` types)
- ✅ ESLint/linting fixes
- ✅ Dependency updates (npm install/update)
- ✅ Security patches (npm audit fix)
- ✅ Test writing (Vitest, React Testing Library)
- ✅ Documentation updates
- ✅ Configuration changes (tsconfig, vite.config, etc.)
- ✅ Utility functions and helpers
- ✅ Non-visual logic changes
- ✅ Performance optimizations (non-UI)
- ✅ Static assets in `/public`

**Use Lovable ONLY for:**
- 🎨 **UI/UX Design Changes** - New components, layout changes, styling, animations
- 🎨 **Visual Refinements** - Design system updates, responsive breakpoints, visual polish
- 🗄️ **Backend/Database Changes** - Schema migrations, RLS policies, Edge Functions (Lovable Cloud)
- 🗄️ **Backend Logic** - Supabase functions, triggers, complex database operations

### 2. Resource Constraint: One Lovable Prompt Per Day (When Needed)
**When we DO need Lovable, we get ONE prompt daily. Make it count.**

This means:
- Every Lovable prompt must be comprehensive and well-thought-out
- Exhaust direct coding options before using Lovable
- Plan Lovable prompts carefully - they're for UI/design and backend only
- Quality over quantity, always
- Most tasks should be handled directly in this repo first

### 3. Backend: Lovable Cloud (NOT Direct Supabase)
**This project uses Lovable Cloud - the managed backend where Lovable controls the Supabase instance.**

**Critical implications:**
- ❌ **NO direct Supabase dashboard access** - Cannot run SQL manually
- ❌ **NO manual migrations** - Must ask Lovable to modify schema
- ❌ **NO direct Edge Function deployment** - Must describe in Lovable prompts
- ❌ **NO service role keys or DB URLs** - System secrets managed by Lovable
- ❌ **Cannot revert** - Once on Cloud, you're committed

**What DOES work:**
- ✅ Static assets in `/public` (images, fonts, etc.)
- ✅ Frontend code changes (components, hooks, pages)
- ✅ Supabase public APIs (transforms, storage URLs)
- ✅ Asking Lovable to create tables, columns, functions, policies

**NEVER create these files (they can't be used):**
- `supabase/migrations/*.sql` - Can't run manually
- `supabase/functions/*` - Can't deploy directly
- Direct database scripts or RPC definitions

**All backend changes must be Lovable prompts.**

### 4. The Golden Rule
**Think Different → Plan Like Da Vinci → Code Directly (or Lovable for UI/Backend) → Verify Obsessively → Iterate Relentlessly**

---

## 📊 PROJECT SNAPSHOT

### Current State
- **Completion**: 80% - Features Complete, Technical Debt Identified ⚠️
- **Phase**: Technical Debt Cleanup (Quality First)
- **Last Major Update**: Nov 20, 2025 (Comprehensive Audit Completed)
- **Status**: Multi-agent platform is functionally complete, but significant technical debt must be addressed before production launch

### The Uncomfortable Reality
After comprehensive audit, we discovered:
- ❌ **91 ESLint errors** (75 errors, 16 warnings) - Primarily `any` types undermining TypeScript safety
- ❌ **Zero automated tests** - No safety net for refactoring or changes
- ❌ **4 npm vulnerabilities** (3 moderate, 1 high) - Security holes in esbuild, glob, js-yaml
- ⚠️ **Outdated dependencies** - React, Vite, Tailwind, Zod need major version updates
- ⚠️ **Bundle size 829 KB** - Exceeds recommended 600 KB threshold

**Decision**: Quality First. We address technical debt BEFORE launch, not after.

### Lighthouse Scores (Nov 20, 2025)
**Desktop:** Performance 97 ⭐ | Accessibility 96 ✅ | Best Practices 100 ✅ | SEO 100 ✅
**Mobile:** Performance 80 ⚠️ | Accessibility 96 ✅ | Best Practices 100 ✅ | SEO 100 ✅

**Core Web Vitals (Mobile):** LCP 5.0s ❌ | FCP 1.5s ✅ | TBT 60ms ✅ | CLS 0 ✅ | SI 3.4s ⚠️
**Core Web Vitals (Desktop):** LCP 1.0s ✅ | FCP 0.6s ✅ | TBT 10ms ✅ | CLS 0 ✅ | SI 1.3s ✅

### Recent Achievements ✅ (Phases 1-7 Complete)
**Phase 1-2 (Nov 16):**
- Image upload system with WebP optimization
- 9-page admin panel with health monitoring
- Forms save to database (contact_inquiries, scheduled_visits)
- Admin authentication fixed (race conditions resolved)
- Privacy Policy & Terms pages (bilingual)
- Favorites sync to Supabase
- Testing checklist (400+ test cases documented)

**Phase 3-4 (Nov 17-19):**
- ✅ **SEO Perfect 100/100!** Structured data, Open Graph, Twitter Cards, sitemap
- ✅ **Desktop Performance 97/100!** Code splitting, lazy loading, priority images
- ✅ **Mobile Performance 80/100!** Improved from 73 (LCP still critical at 5.0s)
- ✅ **Best Practices 100/100!** Security, HTTPS, no vulnerabilities
- ✅ Smart code splitting (~150 KB savings: Map + Admin lazy loaded)
- ✅ Bundle optimization (removed unused deps: i18next, embla, cmdk, chart, carousel)

**Phase 5 (Nov 20 - Multi-Tenant Foundation):**
- ✅ **Agent Management UI** - Admin can invite agents, view profiles, search
- ✅ **Agent Invitation System** - Email invitations with magic link flow (7-day token)
- ✅ **Agent Onboarding Wizard** - 5-step profile completion (photo, bio, contact, zones, social)
- ✅ **Profile Completion Guard** - Redirects incomplete profiles to onboarding
- ✅ **Agent Dashboard** - Protected dashboard with stats (properties, inquiries, visits)
- ✅ **Edit Profile Page** - Agents can update their profile anytime

**Phase 6 (Nov 20 - Email Routing & Property Assignment):**
- ✅ **Dynamic Email Routing** - Contact form fetches org email from DB (no hardcoding)
- ✅ **Agent Email Routing** - Visit scheduling routes to property's agent (fallback to org)
- ✅ **Property Auto-Assignment** - New properties auto-assign to uploader's profile
- ✅ **Property Reassignment UI** - Admin can reassign properties with audit logging
- ✅ **useAgents Hook** - Reusable hook for fetching organization agents

**Phase 7 (Nov 20 - User Features & Agent Directory):**
- ✅ **User Registration & Authentication** - Smart redirects based on role (admin→/admin, agent→/agent/dashboard, user→/cuenta)
- ✅ **User Dashboard (/cuenta)** - Profile management, email verification, favorites display, account deactivation
- ✅ **Profile Creation on Signup** - Auto-creates profile with default display_name from email
- ✅ **Profile Editing** - Users can update display_name and phone number
- ✅ **Header User Menu** - Dropdown with avatar, "Mi Cuenta", "Mis Favoritos", "Cerrar Sesión"
- ✅ **Favorites Signup Prompts** - Banners encourage guests to sign up or verify email
- ✅ **Agent Directory (/agentes)** - Public gallery with search, zone, language, specialty filters
- ✅ **Agent Profile Pages (/agentes/:slug)** - SEO-optimized individual agent profiles with properties
- ✅ **Property-Agent Integration** - PropertyCard shows agent attribution, PropertyDetail has agent contact card
- ✅ **Agent Filter in Properties** - Filter properties by agent with dropdown and active badge

### Recommended Path Forward: QUALITY FIRST ⚡

**PHASE 1: TECHNICAL DEBT CLEANUP (THIS WEEK - CRITICAL)**

**Day 1: Security Patches (IMMEDIATE - DIRECT CODING)**
- [ ] Run `npm audit fix` to patch 4 vulnerabilities
- [ ] Verify build still works
- [ ] Commit package-lock.json updates
- **Why First:** Security vulnerabilities are unacceptable in production
- **Effort:** Direct coding via Claude Code, 15 minutes
- **Method:** Direct repo work (not Lovable)

**Day 2-3: ESLint Cleanup (HIGH PRIORITY - DIRECT CODING)**
- [ ] Analyze all 91 ESLint errors systematically
- [ ] Fix `any` types (75 errors) - direct code changes
- [ ] Fix React hooks issues (exhaustive-deps, rules-of-hooks)
- [ ] Fix remaining warnings (react-refresh, prefer-const)
- **Why:** Type safety is foundational to maintainability
- **Effort:** Direct coding via Claude Code
- **Method:** Direct repo work (not Lovable)

**Day 4-5: Test Framework & Critical Coverage (HIGH PRIORITY - DIRECT CODING)**
- [ ] Add Vitest + React Testing Library config
- [ ] Write tests for authentication flows
- [ ] Write tests for key user journeys (signup, favorites, property CRUD)
- [ ] Write tests for admin operations
- **Why:** No tests = no confidence in changes
- **Effort:** Direct coding via Claude Code
- **Method:** Direct repo work (not Lovable)

**Day 6-7: Dependency Updates (MEDIUM PRIORITY - DIRECT CODING)**
- [ ] Update React 18.x → 19.x (if stable)
- [ ] Update Vite to latest
- [ ] Update Tailwind, Zod, other critical deps
- [ ] Test thoroughly after each major update
- **Why:** Outdated dependencies accumulate vulnerabilities
- **Effort:** Direct coding via Claude Code
- **Method:** Direct repo work (not Lovable)

**PHASE 2: LAUNCH PREP (NEXT WEEK - AFTER QUALITY GATES PASS)**

**Quality Gates (Must Pass Before Phase 2):**
- ✅ Zero ESLint errors
- ✅ Test coverage ≥ 70% for critical paths (auth, admin, user flows)
- ✅ Zero npm vulnerabilities
- ✅ All dependencies current (within last 6 months)
- ✅ Bundle size < 700 KB (or 829 KB with documented justification)

**Content Updates (NO CODE):**
1. Yas & Carlo complete profiles at `/onboarding/complete-profile`
2. Yas adds properties via `/admin/properties`
3. Write real About Us content
4. Final manual testing pass
5. Launch with confidence! 🚀

**PHASE 3: POST-LAUNCH POLISH (OPTIONAL)**
- Map experience improvements
- Mobile performance optimization (LCP < 2.5s)
- Advanced features (multi-language properties, comparison tool)

**STRATEGIC PRINCIPLE:**
> "Perfect is the enemy of good" is an excuse for mediocrity.
> "Good enough" means excellent code quality, secure dependencies, and adequate test coverage.
> We ship when quality gates pass, not when features are complete.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Maps**: Leaflet + React Leaflet
- **Animations**: Framer Motion
- **i18n**: Custom LanguageContext (bilingual ES/EN)
- **Forms**: React Hook Form + Zod
- **State**: React Query + Context API

### Architecture Principles
- Type-safe throughout (TypeScript strict)
- Component composition (shadcn/ui patterns)
- Server state via React Query (5-min cache)
- Row Level Security (RLS) on all tables
- Bilingual by default (ES/EN)

---

## 🔄 THE WORKFLOW (Sacred Steps)

### Step 1: SYNC & REVIEW (Pull the Truth)
```bash
git fetch && git pull origin main
git log --oneline -10  # Review recent commits
```

**Purpose**: Understand recent changes (from Lovable or direct coding)
- Read commit messages
- Review changed files
- Check for any issues or regressions
- Verify documentation updates

### Step 2: ANALYZE & ASSESS (Understand Reality)
**Questions to answer:**
- Where are we actually at? (vs where we think we are)
- What was implemented well?
- What needs refinement?
- What's the highest-value next step?
- Are there any blockers or dependencies?
- Can this be done directly in the repo, or does it require Lovable?

**Check these files:**
- `README.md` - Current completion status
- `AUDIT.md` - Detailed status breakdown
- `TESTING_CHECKLIST.md` - What needs testing
- `PRODUCTION_CHECKLIST.md` - Launch readiness

### Step 3: PLAN & PRIORITIZE (Think Different)
**Ask the hard questions:**
- Is this the RIGHT thing to build next?
- What's the simplest solution that could work?
- How does this serve the user/business?
- What can we eliminate without losing value?
- What's the Steve Jobs version of this feature?

**Priority framework:**
1. **Critical** - Breaks core functionality if missing
2. **High** - Significantly improves user experience
3. **Medium** - Nice-to-have enhancement
4. **Low** - Future consideration

### Step 4: COLLABORATE & CLARIFY (Get Alignment)
**Before implementing, confirm with Carlo when:**
- The specific problem we're solving needs clarification
- The desired outcome is unclear
- There are constraints or preferences to consider
- Priority relative to other work is ambiguous

**Use AskUserQuestion tool when:**
- Multiple valid approaches exist
- Unclear requirements
- Trade-offs need human judgment
- Design decisions affect brand/UX

### Step 5: IMPLEMENT (Code Directly or Lovable)

**Decision Tree:**

1. **Is this a UI/design change or backend/database modification?**
   - YES → Use Lovable (see "LOVABLE PROMPT ENGINEERING" section)
   - NO → Continue to step 2

2. **Can this be handled with direct code changes in the repo?**
   - YES → Code it directly using Claude Code tools (Edit, Write, Bash)
   - NO → Use Lovable

**For Direct Coding:**
- Use Edit tool for existing files
- Use Write tool for new files (rarely needed)
- Use Bash tool for npm commands, git operations
- Run tests and builds to verify
- Commit changes with clear messages

**For Lovable Prompts:**
- See "LOVABLE PROMPT ENGINEERING" section below
- Remember: ONE prompt per day, make it count

### Step 6: DOCUMENT & SYNC (Leave No Trace Behind)

**After implementing (direct code OR Lovable), update:**
- `AUDIT.md` - Mark completed items, update percentages
- `README.md` - Add new features to list (if applicable)
- `TESTING_CHECKLIST.md` - Add test cases for new features
- Any relevant guides (DEPLOYMENT.md, FEATURES.md, etc.)

**For Direct Coding - Commit changes:**
```bash
git add .
git commit -m "type(scope): clear description of what changed"
git push origin main
```

**For Lovable Changes - Pull and review:**
```bash
git pull origin main
# Review what Lovable implemented
```

### Step 7: ITERATE (Pursuit of Perfection)
**Review the implementation:**
- Does it match the vision?
- Does it feel right?
- Is it simple and elegant?
- Can it be better?
- Are there bugs or edge cases missed?

**If refinement needed:**
- Direct code fixes → Edit directly
- UI/design refinements → New Lovable prompt
- Return to Step 3 with specific improvements in mind

---

## 🎨 LOVABLE PROMPT ENGINEERING

**⚠️ USE THIS SECTION ONLY FOR:**
- UI/UX design changes
- Visual refinements and styling
- Backend/database changes (schema, RLS, Edge Functions)

**For everything else (bug fixes, tests, refactoring, dependencies):** Code directly in this repo.

---

### The Anatomy of a Perfect Prompt

**Structure:**
```markdown
# [CLEAR FEATURE NAME IN CAPS]

## Context
[Why we're doing this, current state, what problem it solves]

## Requirements
1. [Specific, measurable requirement]
2. [Another specific requirement]
...

## Implementation Details
- [Technical specifics if needed]
- [Edge cases to handle]
- [Integration points]

## Quality Standards
- Maintain TypeScript type safety
- Ensure bilingual support (ES/EN)
- Follow existing component patterns (shadcn/ui)
- Maintain accessibility (WCAG 2.1 AA)
- Respect existing animations/design system
- Test on mobile and desktop

## Success Criteria
- [Observable outcome 1]
- [Observable outcome 2]
...

## Files Likely Affected
- src/components/[Component].tsx
- src/pages/[Page].tsx
- ...
```

### Prompt Best Practices

**DO:**
- ✅ Be specific and concrete
- ✅ Group related changes into ONE comprehensive prompt
- ✅ Specify expected behavior clearly
- ✅ Include edge cases and error handling
- ✅ Reference existing patterns/components to follow
- ✅ Specify accessibility requirements
- ✅ Include bilingual considerations
- ✅ Test scenarios to verify

**DON'T:**
- ❌ Be vague or ambiguous
- ❌ Ask for multiple unrelated features
- ❌ Assume Lovable knows project context
- ❌ Skip quality standards
- ❌ Forget about mobile/responsive
- ❌ Ignore existing design patterns
- ❌ Leave internationalization as afterthought

### Example: Bad vs Good Prompt

**❌ BAD:**
```
Add a search feature to the site
```

**✅ GOOD:**
```
# PROPERTY SEARCH WITH REAL-TIME SUGGESTIONS

## Context
Users currently can only filter properties using the sidebar filters. We need a text search in the header that searches across property titles and descriptions in both languages, providing real-time suggestions as they type.

## Requirements
1. Add search input to Header component (visible on all pages)
2. Search should query against title_es, title_en, description_es, description_en
3. Show live suggestions dropdown (max 5 results) as user types
4. Debounce search input (300ms) to avoid excessive queries
5. Click on suggestion navigates to property detail page
6. Pressing Enter with text searches and navigates to /propiedades with search param
7. Show "No results" message when search returns empty
8. Search history saved to localStorage (last 5 searches)

## Implementation Details
- Add search icon from lucide-react in header
- Use Supabase full-text search with `.textSearch()` or `.ilike()` for matching
- Create new component: `src/components/SearchBar.tsx`
- Integrate with existing useProperties hook or create usePropertySearch
- Use Command component from shadcn/ui for suggestions dropdown
- Add keyboard navigation (arrow keys, enter, escape)

## Quality Standards
- TypeScript types for search results
- Accessible (ARIA labels, keyboard navigation)
- Works on mobile (consider mobile search UX)
- Bilingual placeholder text
- Loading state while searching
- Smooth animations for dropdown appearance

## Success Criteria
- User can type in header search and see suggestions
- Clicking suggestion goes to property detail
- Search persists in URL params on properties page
- Search history shows on focus (empty input)
- Works smoothly on mobile devices

## Files Likely Affected
- src/components/Header.tsx
- src/components/SearchBar.tsx (new)
- src/hooks/usePropertySearch.ts (new, maybe)
- src/lib/utils.ts (debounce utility if not exists)
```

---

## 🎯 DECISION FRAMEWORKS

### When to Use ONE vs MULTIPLE Prompts

**Combine into ONE prompt when:**
- Changes are related to the same feature
- Dependencies between changes
- Total scope is reasonable for single implementation
- All changes improve same user flow

**Split into MULTIPLE prompts when:**
- Features are independent
- Scope is very large (>10 files affected)
- Different areas of application (e.g., admin + public)
- Want to test one before building the next

### Priority Decision Matrix

| Impact | Effort | Priority | When to Do |
|--------|--------|----------|------------|
| High | Low | **P0 - Now** | Today's prompt |
| High | High | **P1 - Soon** | Next 1-2 prompts |
| Low | Low | **P2 - Later** | Batch with others |
| Low | High | **P3 - Maybe** | Reconsider if needed |

### What Belongs in This Repo vs Lovable

**Direct Coding in This Repo (via Claude Code):**
- ✅ **Documentation** - All markdown files (README, CLAUDE.md, AUDIT.md, etc.)
- ✅ **Bug Fixes** - Non-UI logic bugs, type errors, ESLint issues
- ✅ **Refactoring** - Code cleanup, removing `any` types, improving structure
- ✅ **Testing** - Writing Vitest tests, React Testing Library tests
- ✅ **Dependencies** - npm install/update, security patches, version updates
- ✅ **Configuration** - tsconfig.json, vite.config.ts, package.json edits
- ✅ **Utilities** - Helper functions, hooks (non-UI logic), type definitions
- ✅ **Performance** - Non-visual optimizations, bundle analysis
- ✅ **Static Assets** - Files in `/public` (images, fonts, etc.)
- ✅ **Scripts** - Build scripts, utility scripts, automation
- ✅ **Git Operations** - Commits, branches, merges, pull requests

**Lovable Prompts (UI/Design & Backend Only):**
- 🎨 **UI Components** - New React components, component restructuring
- 🎨 **Styling** - CSS/Tailwind changes, animations, responsive design
- 🎨 **Layout Changes** - Page structure, navigation, design system updates
- 🎨 **Visual Polish** - Aesthetic improvements, spacing, colors, typography
- 🗄️ **Database Schema** - Table creation, column changes, migrations
- 🗄️ **RLS Policies** - Row Level Security policy changes
- 🗄️ **Edge Functions** - Supabase functions, triggers, backend logic
- 🗄️ **Backend Integrations** - API connections, third-party services

---

## 📚 KEY REFERENCE DOCS

**Must-read before planning:**
- `AUDIT.md` - Comprehensive status (what's done, what's not)
- `README.md` - Current features and quick start
- `TESTING_CHECKLIST.md` - What needs testing
- `PRODUCTION_CHECKLIST.md` - Launch readiness

**Helpful references:**
- `NEXT_STEPS.md` - Long-term roadmap ideas
- `FEATURES.md` - Feature details
- `DEPLOYMENT.md` - How to deploy

---

## ✨ QUALITY STANDARDS (Non-Negotiable)

Every code change (direct or Lovable) must ensure:

1. **Type Safety** - Full TypeScript, no `any` types
2. **Accessibility** - WCAG 2.1 AA compliance
3. **Responsive** - Mobile-first, works 320px to 1920px
4. **Bilingual** - Spanish & English, no hardcoded strings
5. **Performance** - Lazy loading, optimized images, fast interactions
6. **Error Handling** - Graceful failures, user feedback
7. **Consistency** - Follow existing patterns (shadcn/ui)
8. **Security** - Input validation, XSS protection, RLS policies

---

## 🎬 EXAMPLES OF GREAT SESSIONS

### Example 1: Performance Optimization Sprint
**Prompt structure:**
- Combined 8 related optimizations into ONE prompt
- Specified measurable outcomes (Lighthouse score targets)
- Included testing methodology
- Result: Comprehensive performance upgrade in single prompt

### Example 2: Feature with Refinement
**Session 1:** Built core comparison feature
**Session 2:** Refined UX based on testing, added PDF export
**Session 3:** Mobile optimization and polish

**Learning:** Sometimes "perfect" takes 2-3 iterations. That's okay.

---

## 🚨 COMMON PITFALLS TO AVOID

1. **Assuming Context** - Lovable doesn't remember previous sessions. Include all context.
2. **Scope Creep** - "While you're at it..." leads to incomplete implementations
3. **Forgetting Mobile** - Always specify mobile behavior
4. **Skipping Edge Cases** - "What if no results?" "What if offline?"
5. **Ignoring Existing Patterns** - "Do it like X component" is powerful
6. **Vague Success Criteria** - "Make it better" vs "Reduce load time to <2s"

---

## 💡 THE LOVABLE MINDSET

**Think of Lovable as your master craftsperson:**
- Give them a complete blueprint (prompt)
- Specify materials and techniques (tech stack, patterns)
- Define done (success criteria)
- Trust their craftsmanship
- Verify the result
- Refine if needed

**Not a conversation, a commission.**

Each prompt is a complete specification for a piece of work. Make it worthy of a craftsperson's time.

---

## 🎯 TODAY'S SESSION CHECKLIST

**Before starting work:**
- [ ] Pulled latest changes from remote
- [ ] Reviewed recent commits
- [ ] Read current AUDIT.md status
- [ ] Identified highest-value next step
- [ ] Confirmed priority with Carlo (if needed)
- [ ] Decided: Direct coding or Lovable prompt?

**For Direct Coding:**
- [ ] Identified files to change
- [ ] Made changes using Edit/Write tools
- [ ] Ran tests/builds to verify (`npm run build`, `npm run lint`)
- [ ] Tested functionality manually (if applicable)
- [ ] Updated documentation (AUDIT.md, README.md)
- [ ] Committed changes with clear message
- [ ] Pushed to remote

**For Lovable Prompts:**
- [ ] Drafted comprehensive prompt
- [ ] Reviewed prompt against quality standards
- [ ] Sent to Lovable
- [ ] Pulled changes after implementation
- [ ] Tested key functionality
- [ ] Updated AUDIT.md, README.md, TESTING_CHECKLIST.md
- [ ] Committed documentation updates

**After any work:**
- [ ] Documentation is up to date
- [ ] Changes are committed and pushed
- [ ] Next steps are clear (if more work needed)

---

## 🌟 NORTH STAR

**Our measure of success:**
Not how much code we write, but how delighted users are.

Every prompt, every feature, every refinement should make someone's day better - whether that's a property buyer finding their dream home, or Yas managing listings effortlessly.

---

**Last Updated**: 2025-11-20
**Project**: YR Inmobiliaria - Real Estate Platform
**Lovable Project**: https://lovable.dev/projects/85042ab5-51cc-4730-a42e-b9fceaafa3a2

---

*"Simplicity is the ultimate sophistication." - Leonardo da Vinci*

*Build something insanely great.* 🚀
