# 🔧 DATABASE SCHEMA REFACTOR - Comprehensive Fix

## 📋 OVERVIEW

We need to fix several critical database schema issues that are causing data integrity problems, duplicate records, and making queries unnecessarily complex.

## ❌ CURRENT PROBLEMS

1. **Duplicate role assignments allowed** - User has 2 identical superadmin roles due to NULL handling in UNIQUE constraint
2. **No foreign key between role_assignments and profiles** - Cannot use JOIN in queries, must fetch separately
3. **No automatic profile creation** - Profiles created manually/inconsistently, leads to orphaned roles
4. **Email not synced** - profiles.email can get out of sync with auth.users.email
5. **Unclear user lifecycle** - No consistency guarantees on signup

## ✅ SOLUTION: 5 Database Changes

---

## CHANGE 1: Fix UNIQUE Constraint (Prevent NULL Duplicates)

**Current constraint:**
```sql
UNIQUE(user_id, organization_id, role)
```

**Problem:** Treats each NULL as distinct, allowing duplicates when organization_id is NULL

**Fix:** Create unique index using COALESCE to treat NULL as a specific value

```sql
-- Remove old constraint
ALTER TABLE role_assignments DROP CONSTRAINT IF EXISTS unique_user_org_role;

-- Add new constraint that handles NULLs properly
CREATE UNIQUE INDEX idx_unique_role_per_user_org
ON role_assignments (
  user_id,
  role,
  COALESCE(organization_id::text, '__GLOBAL__')
);
```

**Result:** Superadmin (NULL org) can only exist once per user ✅

---

## CHANGE 2: Add Foreign Key to Profiles

**Purpose:** Enable JOIN queries and ensure referential integrity

```sql
-- Add foreign key from role_assignments to profiles
ALTER TABLE role_assignments
ADD CONSTRAINT fk_role_assignments_profiles
FOREIGN KEY (user_id)
REFERENCES profiles(user_id)
ON DELETE CASCADE
DEFERRABLE INITIALLY DEFERRED;
```

**Note:** `DEFERRABLE INITIALLY DEFERRED` allows profile and role to be created in same transaction

**Result:** Can now JOIN role_assignments with profiles ✅

---

## CHANGE 3: Auto-Create Profile on User Signup

**Purpose:** Ensure every user has a profile, prevent orphaned data

```sql
-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_display_name TEXT;
  yr_org_id UUID;
BEGIN
  -- Extract name from email (before @)
  default_display_name := SPLIT_PART(NEW.email, '@', 1);

  -- Get YR Inmobiliaria org ID
  SELECT id INTO yr_org_id FROM organizations WHERE slug = 'yr-inmobiliaria';

  -- Create profile automatically
  INSERT INTO public.profiles (
    user_id,
    email,
    display_name,
    is_complete,
    email_verified,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', default_display_name),
    false,
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    NOW(),
    NOW()
  ) ON CONFLICT (user_id) DO NOTHING;

  -- Auto-assign default 'user' role
  INSERT INTO public.role_assignments (
    user_id,
    role,
    granted_at
  ) VALUES (
    NEW.id,
    'user',
    NOW()
  ) ON CONFLICT DO NOTHING;

  -- Check for auto-admin emails (Carlo and Yas)
  IF NEW.email = 'carlo.spada22@gmail.com' THEN
    -- Carlo: SuperAdmin (global, no org)
    INSERT INTO public.role_assignments (
      user_id,
      organization_id,
      role,
      granted_at
    ) VALUES (
      NEW.id,
      NULL,
      'superadmin',
      NOW()
    ) ON CONFLICT DO NOTHING;

  ELSIF NEW.email = 'ruizvasquezyazmin@gmail.com' AND yr_org_id IS NOT NULL THEN
    -- Yas: Admin of YR Inmobiliaria
    INSERT INTO public.role_assignments (
      user_id,
      organization_id,
      role,
      granted_at
    ) VALUES (
      NEW.id,
      yr_org_id,
      'admin',
      NOW()
    ) ON CONFLICT DO NOTHING;

    -- Update Yas's profile to be in YR org
    UPDATE public.profiles
    SET organization_id = yr_org_id,
        updated_at = NOW()
    WHERE user_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

**Result:** Every signup creates profile + default role automatically ✅

---

## CHANGE 4: Sync Email Changes

**Purpose:** Keep profiles.email in sync with auth.users.email

```sql
-- Function to sync email changes
CREATE OR REPLACE FUNCTION sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles
    SET email = NEW.email,
        updated_at = NOW()
    WHERE user_id = NEW.id;

    RAISE NOTICE 'Synced email for user %: % -> %', NEW.id, OLD.email, NEW.email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_email_changed ON auth.users;
CREATE TRIGGER on_auth_user_email_changed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION sync_user_email();
```

**Result:** Email changes in auth automatically update profiles ✅

---

## CHANGE 5: Clean Up Existing Duplicate Roles

**Purpose:** Remove duplicate role assignments that exist due to old constraint

```sql
-- Remove duplicate role assignments (keep most recent)
WITH duplicates AS (
  SELECT
    id,
    user_id,
    role,
    organization_id,
    granted_at,
    ROW_NUMBER() OVER (
      PARTITION BY
        user_id,
        role,
        COALESCE(organization_id::text, '__GLOBAL__')
      ORDER BY granted_at DESC NULLS LAST, created_at DESC NULLS LAST
    ) as row_num
  FROM role_assignments
)
DELETE FROM role_assignments
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
);

-- Log results
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Cleaned up % duplicate role assignments', deleted_count;
END $$;
```

**Result:** Carlo's 2 superadmin roles → 1 superadmin role ✅

---

## 📊 MIGRATION ORDER (CRITICAL!)

Execute in this exact order to avoid constraint violations:

1. **CHANGE 5** - Clean up duplicates FIRST (before adding stricter constraint)
2. **CHANGE 1** - Fix UNIQUE constraint (now no duplicates exist)
3. **CHANGE 3** - Add auto-create trigger (ensures profiles exist going forward)
4. **CHANGE 2** - Add FK to profiles (now all users have profiles)
5. **CHANGE 4** - Add email sync trigger (maintenance going forward)

---

## ✅ VERIFICATION QUERIES

Run these after migration to verify success:

```sql
-- 1. Check no duplicate roles exist
SELECT
  user_id,
  role,
  COALESCE(organization_id::text, 'GLOBAL') as org,
  COUNT(*) as count
FROM role_assignments
GROUP BY user_id, role, COALESCE(organization_id::text, 'GLOBAL')
HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- 2. Check all role_assignments have profiles
SELECT COUNT(*)
FROM role_assignments ra
LEFT JOIN profiles p ON ra.user_id = p.user_id
WHERE p.user_id IS NULL;
-- Expected: 0

-- 3. Check Carlo has exactly 1 superadmin role
SELECT COUNT(*)
FROM role_assignments
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'carlo.spada22@gmail.com')
  AND role = 'superadmin';
-- Expected: 1

-- 4. Verify foreign key exists
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'role_assignments'
  AND kcu.column_name = 'user_id';
-- Expected: 1 row showing FK to profiles

-- 5. Test auto-create trigger (create test user)
-- This should auto-create profile and assign 'user' role
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES (
  gen_random_uuid(),
  'test_trigger_' || gen_random_uuid() || '@example.com',
  crypt('test123456', gen_salt('bf')),
  NOW()
);
-- Then check profile and role were created
```

---

## 📝 NEW SCHEMA DOCUMENTATION

### User Lifecycle After Migration:

```
User Signup (via /auth)
    ↓
1. auth.users created (Supabase Auth)
    ↓ TRIGGER: on_auth_user_created
2. profiles created automatically
   - display_name: from email (before @)
   - email: copied from auth.users
   - is_complete: false
    ↓ TRIGGER: on_auth_user_created (continued)
3. role_assignments created
   - Default: 'user' role
   - If Carlo: 'superadmin' role (NULL org)
   - If Yas: 'admin' role (YR org)
    ↓
Result: ✅ Consistent, ✅ Complete, ✅ No orphans
```

### Data Integrity Guarantees:

- ✅ Every user has exactly ONE profile
- ✅ Every user has at least ONE role (default: 'user')
- ✅ No duplicate roles (same user + role + org)
- ✅ Email stays synced between auth.users and profiles
- ✅ Can JOIN role_assignments with profiles (FK exists)
- ✅ Deleting profile cascades to role_assignments

---

## 🚀 IMPLEMENTATION INSTRUCTIONS

**For Lovable:**

1. Go to your Lovable project: https://lovable.dev/projects/85042ab5-51cc-4730-a42e-b9fceaafa3a2
2. Navigate to Database → SQL Editor (or similar)
3. Copy and paste the SQL from each CHANGE section
4. Execute in the order specified in "MIGRATION ORDER"
5. Run verification queries after each change
6. Test signup flow with a new user

**Expected Results:**

- All verification queries should pass
- New user signups should auto-create profiles
- Carlo should have exactly 1 superadmin role
- Admin Users page should work with JOIN query

---

## 🐛 ROLLBACK PLAN (If Something Goes Wrong)

```sql
-- Rollback Change 4 (email sync trigger)
DROP TRIGGER IF EXISTS on_auth_user_email_changed ON auth.users;
DROP FUNCTION IF EXISTS sync_user_email();

-- Rollback Change 3 (auto-create trigger)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Rollback Change 2 (FK)
ALTER TABLE role_assignments DROP CONSTRAINT IF EXISTS fk_role_assignments_profiles;

-- Rollback Change 1 (UNIQUE constraint)
DROP INDEX IF EXISTS idx_unique_role_per_user_org;
ALTER TABLE role_assignments
ADD CONSTRAINT unique_user_org_role
UNIQUE(user_id, organization_id, role);

-- Change 5 (duplicate cleanup) cannot be rolled back
-- You would need to restore from backup
```

---

## ⚠️ IMPORTANT NOTES

1. **Backup First!** Export your database before running this migration
2. **Test in Development** If you have a dev environment, test there first
3. **Monitor Triggers** Watch for trigger errors in Supabase logs after deployment
4. **Update Frontend Code** After FK is added, we can simplify the AdminUsers query to use JOIN

---

## 📞 NEXT STEPS AFTER MIGRATION

1. ✅ Verify all queries pass
2. ✅ Test signup flow with new user
3. ✅ Update AdminUsers.tsx to use JOIN instead of separate queries
4. ✅ Test admin dashboard to ensure all users display correctly
5. ✅ Monitor for any trigger errors in production

---

**Ready to execute?** Copy the SQL from each CHANGE section and run in Lovable! 🚀
