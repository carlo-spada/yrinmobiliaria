# 🔧 DATABASE SCHEMA MIGRATION (TEMPORARY FILE - DELETE AFTER COMPLETION)

**Last Updated:** November 21, 2025
**Status:** Ready to Send to Lovable
**Delete After:** Migration is complete and verified

---

## 📋 LOVABLE PROMPT

**Copy the entire prompt below and send it to Lovable:**

---

# FIX DATABASE SCHEMA - Remove Duplicates, Add Foreign Keys, Auto-Create Profiles

## Context

We have critical database schema issues causing data integrity problems:

1. **Duplicate role assignments** - One user (carlo.spada22@gmail.com) has 2 identical superadmin roles because the UNIQUE constraint doesn't handle NULL organization_id properly
2. **No foreign key between role_assignments and profiles** - This prevents JOIN queries and causes referential integrity issues. Currently we have to fetch data separately and merge in JavaScript
3. **No automatic profile creation** - Profiles are created inconsistently, leading to orphaned role assignments without corresponding profiles
4. **Email not synced** - The profiles.email field can get out of sync with auth.users.email
5. **Unclear user lifecycle** - No consistency guarantees on user signup

These issues make queries complex, slow, and error-prone. The AdminUsers page currently fails with "Could not find a relationship between role_assignments and profiles" errors.

## Requirements

### 1. Fix UNIQUE Constraint to Prevent NULL Duplicates

**Current constraint:**
```sql
UNIQUE(user_id, organization_id, role)
```

**Problem:** SQL treats each NULL as distinct, so duplicate rows with NULL organization_id are allowed.

**Fix:** Replace with a unique index that uses COALESCE to treat NULL as a specific value:
```sql
CREATE UNIQUE INDEX idx_unique_role_per_user_org
ON role_assignments (user_id, role, COALESCE(organization_id::text, '__GLOBAL__'));
```

### 2. Clean Up Existing Duplicate Roles

Remove duplicate role assignments, keeping only the most recent one for each (user_id, role, organization_id) combination.

Expected result: User carlo.spada22@gmail.com should have exactly 1 superadmin role (not 2).

### 3. Add Foreign Key to Profiles

Add a foreign key constraint from role_assignments.user_id to profiles.user_id:

```sql
ALTER TABLE role_assignments
ADD CONSTRAINT fk_role_assignments_profiles
FOREIGN KEY (user_id) REFERENCES profiles(user_id)
ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
```

Use `DEFERRABLE INITIALLY DEFERRED` to allow profile and role creation in the same transaction.

### 4. Auto-Create Profile on User Signup

Create a trigger on auth.users that automatically:
- Creates a profile when a user signs up (using email prefix as default display_name)
- Assigns default 'user' role
- Auto-assigns 'superadmin' role if email is carlo.spada22@gmail.com (NULL organization)
- Auto-assigns 'admin' role if email is ruizvasquezyazmin@gmail.com (YR Inmobiliaria organization)

### 5. Sync Email Changes

Create a trigger to keep profiles.email in sync with auth.users.email when the email changes.

## Implementation Details

**Migration Order (CRITICAL):**
1. Clean up duplicates FIRST (before adding stricter constraint)
2. Fix UNIQUE constraint
3. Add auto-create profile trigger (ensures profiles exist going forward)
4. Add foreign key (now all users have profiles)
5. Add email sync trigger

**Specific Implementation:**

**Step 1: Clean Duplicates**
```sql
WITH duplicates AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY user_id, role, COALESCE(organization_id::text, '__GLOBAL__')
    ORDER BY granted_at DESC NULLS LAST, created_at DESC NULLS LAST
  ) as row_num FROM role_assignments
)
DELETE FROM role_assignments WHERE id IN (SELECT id FROM duplicates WHERE row_num > 1);
```

**Step 2: Create Trigger Function**
```sql
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
DECLARE
  default_display_name TEXT;
  yr_org_id UUID;
BEGIN
  default_display_name := SPLIT_PART(NEW.email, '@', 1);
  SELECT id INTO yr_org_id FROM organizations WHERE slug = 'yr-inmobiliaria';

  INSERT INTO public.profiles (user_id, email, display_name, is_complete, email_verified, created_at, updated_at)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', default_display_name),
          false, COALESCE(NEW.email_confirmed_at IS NOT NULL, false), NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.role_assignments (user_id, role, granted_at)
  VALUES (NEW.id, 'user', NOW()) ON CONFLICT DO NOTHING;

  IF NEW.email = 'carlo.spada22@gmail.com' THEN
    INSERT INTO public.role_assignments (user_id, organization_id, role, granted_at)
    VALUES (NEW.id, NULL, 'superadmin', NOW()) ON CONFLICT DO NOTHING;
  ELSIF NEW.email = 'ruizvasquezyazmin@gmail.com' AND yr_org_id IS NOT NULL THEN
    INSERT INTO public.role_assignments (user_id, organization_id, role, granted_at)
    VALUES (NEW.id, yr_org_id, 'admin', NOW()) ON CONFLICT DO NOTHING;
    UPDATE public.profiles SET organization_id = yr_org_id, updated_at = NOW() WHERE user_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**Step 3: Email Sync Trigger**
```sql
CREATE OR REPLACE FUNCTION sync_user_email() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles SET email = NEW.email, updated_at = NOW() WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_email_changed AFTER UPDATE ON auth.users
FOR EACH ROW WHEN (OLD.email IS DISTINCT FROM NEW.email)
EXECUTE FUNCTION sync_user_email();
```

## Success Criteria

After migration:
- ✅ User carlo.spada22@gmail.com has exactly 1 superadmin role (not 2)
- ✅ Can query `role_assignments` with JOIN to `profiles` successfully
- ✅ New user signups automatically create profiles + default 'user' role
- ✅ Carlo and Yas auto-receive admin roles on signup
- ✅ Email changes in auth.users automatically update profiles.email
- ✅ AdminUsers page displays all users without errors
- ✅ No orphaned role_assignments without corresponding profiles

## Verification Queries

Please run these verification queries after migration to confirm success:

```sql
-- 1. No duplicate roles exist
SELECT user_id, role, COALESCE(organization_id::text, 'GLOBAL') as org, COUNT(*)
FROM role_assignments GROUP BY user_id, role, COALESCE(organization_id::text, 'GLOBAL')
HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- 2. All role_assignments have profiles
SELECT COUNT(*) FROM role_assignments ra
LEFT JOIN profiles p ON ra.user_id = p.user_id WHERE p.user_id IS NULL;
-- Expected: 0

-- 3. Carlo has exactly 1 superadmin
SELECT COUNT(*) FROM role_assignments ra JOIN auth.users u ON ra.user_id = u.id
WHERE u.email = 'carlo.spada22@gmail.com' AND ra.role = 'superadmin';
-- Expected: 1

-- 4. Triggers exist
SELECT trigger_name, event_object_table FROM information_schema.triggers
WHERE trigger_name IN ('on_auth_user_created', 'on_auth_user_email_changed');
-- Expected: 2 rows
```

## Quality Standards

- Maintain referential integrity with proper foreign keys
- Use DEFERRABLE constraints to allow transactional consistency
- Handle edge cases (NULL organization_id for superadmins)
- Preserve existing data (only remove exact duplicates)
- Add proper indexes for query performance
- Use SECURITY DEFINER for triggers to ensure proper permissions

## Additional Notes

- The UNIQUE constraint uses COALESCE to treat NULL organization_id as '__GLOBAL__' for uniqueness purposes
- The foreign key is DEFERRABLE INITIALLY DEFERRED to allow triggers to create profile and role in same transaction
- Auto-admin logic: Carlo gets global superadmin (NULL org), Yas gets YR Inmobiliaria admin
- All triggers use ON CONFLICT DO NOTHING to be idempotent and safe

---

**END OF LOVABLE PROMPT**

---

## 🚀 HOW TO USE

1. **Copy everything** from "# FIX DATABASE SCHEMA" to "END OF LOVABLE PROMPT" above
2. **Go to Lovable:** https://lovable.dev/projects/85042ab5-51cc-4730-a42e-b9fceaafa3a2
3. **Paste in chat** and send
4. **Wait for Lovable** to implement the changes
5. **Verify** using the queries in the prompt
6. **Delete this file** when done

---

## 📝 AFTER MIGRATION

Once Lovable confirms success:
1. ✅ I'll update AdminUsers.tsx to use JOIN (simpler code)
2. ✅ Test signup with new user
3. ✅ Verify admin dashboard works
4. ✅ **DELETE THIS FILE**
