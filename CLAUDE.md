# 🎯 YR Inmobiliaria - Project Intelligence Brief

> **Philosophy**: We're not here to write code. We're here to orchestrate excellence through Lovable.dev and create something insanely great.

**Last Updated:** November 20, 2025 (Multi-Tenant Foundation - Phase 1/5 Complete)

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

### 1. Development Model: Lovable-First
**ALL code implementation happens through lovable.dev - NEVER edit code directly in this repo.**

This repo is for:
- ✅ Planning and strategy
- ✅ Documentation and tracking
- ✅ Review and verification
- ✅ Prompt engineering for Lovable
- ❌ NOT for code changes

### 2. Resource Constraint: One Prompt Per Day
**We get ONE Lovable prompt daily. Make it count.**

This means:
- Every prompt must be comprehensive and well-thought-out
- No room for "let me try this quick thing"
- Planning is MORE important than speed
- Quality over quantity, always

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
**Think Different → Plan Like Da Vinci → Craft Through Lovable → Verify Obsessively → Iterate Relentlessly**

---

## 📊 PROJECT SNAPSHOT

### Current State
- **Completion**: 98% - Production Ready 🚀
- **Phase**: Image Pipeline & Map Refinement
- **Last Major Update**: Nov 19, 2025 (Hero Image Optimization Complete)
- **Status**: SEO perfect (100/100), Desktop excellent (97/100), Mobile LCP fix deployed (awaiting verification)

### Lighthouse Scores (Nov 17, 2025 - Updated)
**Desktop:** Performance 97 ⭐ | Accessibility 83 ⚠️ | Best Practices 100 ✅ | SEO 100 ✅
**Mobile:** Performance 80 ⚠️ | Accessibility 83 ⚠️ | Best Practices 100 ✅ | SEO 100 ✅

**Core Web Vitals (Mobile):** LCP 5.0s ❌ | FCP 1.5s ✅ | TBT 60ms ✅ | CLS 0 ✅ | SI 3.4s ⚠️
**Core Web Vitals (Desktop):** LCP 1.0s ✅ | FCP 0.6s ✅ | TBT 10ms ✅ | CLS 0 ✅ | SI 1.3s ✅

### Recent Achievements ✅ (Phase 1-4)
**Phase 1-2 (Nov 16):**
- Image upload system with WebP optimization
- 9-page admin panel with health monitoring
- Forms save to database (contact_inquiries, scheduled_visits)
- Admin authentication fixed (race conditions resolved)
- Privacy Policy & Terms pages (bilingual)
- Favorites sync to Supabase
- Testing checklist (400+ test cases documented)

**Phase 3-4 (Nov 17):**
- ✅ **SEO Perfect 100/100!** Structured data, Open Graph, Twitter Cards, sitemap
- ✅ **Desktop Performance 97/100!** Code splitting, lazy loading, priority images
- ✅ **Mobile Performance 80/100!** Improved from 73 (LCP still critical at 5.0s)
- ✅ **Best Practices 100/100!** Security, HTTPS, no vulnerabilities
- ✅ Smart code splitting (~150 KB savings: Map + Admin lazy loaded)
- ✅ Priority image loading for LCP optimization
- ✅ Font optimization with preload hints

**Phase 5 (Nov 19):**
- ✅ **Hero Image Pipeline** - AVIF/WebP variants at 6 breakpoints (480-1920w)
- ✅ **ResponsiveImage Component** - Supports variants + Supabase transform fallback
- ✅ **HeroSection Optimized** - AVIF-first with proper srcset/preloads
- ✅ **image_variants Migration** - JSONB column ready for property images
- ✅ **Sharp Generation Script** - `node scripts/generate-hero-images.js`
- ✅ **Edge Function Stub** - Ready for WASM/Transform API implementation
- ✅ **IMAGE_PIPELINE_PROPOSAL.md** - Architecture decision documented

### Critical Next Steps
1. **HIGH**: Map Experience Fixes
   - Fix invalid JSON path in bounds filter (`location->>coordinates->>lat`)
   - Import cluster CSS (MarkerCluster.css, MarkerCluster.Default.css)
   - Implement map decisions (bounds-synced list, location toggle)
2. **HIGH**: Accessibility Improvements (83 → 95+)
   - Buttons without accessible names (icon buttons need aria-label)
   - Select elements without associated labels
   - ARIA input fields without accessible names
   - Contrast ratio fixes
3. **MEDIUM**: Edge Function Upload Pipeline
   - Implement WASM-based optimization or Supabase Transform API
   - Zero-friction property photo uploads
4. **Content**: Yas & Carlo sign up and add properties
5. **Verify**: Run Lighthouse to confirm LCP improvement (target <2.5s)

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

**Purpose**: Understand what Lovable built since last session
- Read commit messages
- Review changed files
- Check for any issues or regressions
- Verify documentation updates

### Step 2: ANALYZE & ASSESS (Understand Reality)
**Questions to answer:**
- Where are we actually at? (vs where we think we are)
- What did Lovable implement well?
- What needs refinement?
- What's the highest-value next step?
- Are there any blockers or dependencies?

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
**Before creating prompts, confirm with Carlo:**
- The specific problem we're solving
- The desired outcome
- Any constraints or preferences
- Priority relative to other work

**Use AskUserQuestion tool when:**
- Multiple valid approaches exist
- Unclear requirements
- Trade-offs need human judgment
- Design decisions affect brand/UX

### Step 5: CRAFT PROMPT (Make It Count)
**Remember: ONE prompt per day. Make it insanely great.**

See "LOVABLE PROMPT ENGINEERING" section below.

### Step 6: DOCUMENT & SYNC (Leave No Trace Behind)
**After Lovable implements, update:**
- `AUDIT.md` - Mark completed items, update percentages
- `README.md` - Add new features to list
- `TESTING_CHECKLIST.md` - Add test cases for new features
- Any relevant guides (DEPLOYMENT.md, FEATURES.md, etc.)

**Commit changes:**
```bash
git add .
git commit -m "docs: update after [feature name] implementation"
git push origin main
```

### Step 7: ITERATE (Pursuit of Perfection)
**Review Lovable's implementation:**
- Does it match the vision?
- Does it feel right?
- Is it simple and elegant?
- Can it be better?

If yes to "can it be better?" → Return to Step 3 with refinements

---

## 🎨 LOVABLE PROMPT ENGINEERING

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

**This Repo (Documentation & Planning):**
- Planning documents (this file!)
- Status tracking (AUDIT.md, README.md)
- Testing checklists
- Deployment guides
- Project decisions and rationale

**Lovable (All Code):**
- Component changes
- New features
- Bug fixes
- Style updates
- Configuration changes
- Database migrations

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

Every Lovable prompt must ensure:

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

Before writing today's prompt:

- [ ] Pulled latest changes from remote
- [ ] Reviewed recent commits
- [ ] Read current AUDIT.md status
- [ ] Identified highest-value next step
- [ ] Confirmed priority with Carlo (if needed)
- [ ] Drafted comprehensive prompt
- [ ] Reviewed prompt against quality standards
- [ ] Ready to send to Lovable

After Lovable implements:

- [ ] Pulled changes and reviewed implementation
- [ ] Tested key functionality
- [ ] Updated AUDIT.md
- [ ] Updated README.md (if needed)
- [ ] Updated TESTING_CHECKLIST.md
- [ ] Committed documentation updates
- [ ] Planned next session (if refinement needed)

---

## 🌟 NORTH STAR

**Our measure of success:**
Not how much code we write, but how delighted users are.

Every prompt, every feature, every refinement should make someone's day better - whether that's a property buyer finding their dream home, or Yas managing listings effortlessly.

---

**Last Updated**: 2025-11-16
**Project**: YR Inmobiliaria - Real Estate Platform
**Lovable Project**: https://lovable.dev/projects/85042ab5-51cc-4730-a42e-b9fceaafa3a2

---

*"Simplicity is the ultimate sophistication." - Leonardo da Vinci*

*Build something insanely great.* 🚀
