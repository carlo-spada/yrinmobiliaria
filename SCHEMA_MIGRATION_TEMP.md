# 🔧 DATABASE SCHEMA MIGRATION (TEMPORARY FILE - DELETE AFTER COMPLETION)

**Last Updated:** November 21, 2025
**Status:** Ready to Execute
**Delete After:** Migration is complete and verified

---

## 📋 QUICK START

Copy-paste these 5 SQL blocks into Lovable SQL Editor, **in this exact order**:

---

### STEP 1: Clean Up Duplicates

```sql
WITH duplicates AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY user_id, role, COALESCE(organization_id::text, '__GLOBAL__')
    ORDER BY granted_at DESC NULLS LAST
  ) as row_num
  FROM role_assignments
)
DELETE FROM role_assignments WHERE id IN (SELECT id FROM duplicates WHERE row_num > 1);

-- Verify: Should return 0 rows
SELECT user_id, role, COUNT(*) FROM role_assignments GROUP BY user_id, role, COALESCE(organization_id::text, 'GLOBAL') HAVING COUNT(*) > 1;
```

---

### STEP 2: Fix UNIQUE Constraint

```sql
ALTER TABLE role_assignments DROP CONSTRAINT IF EXISTS unique_user_org_role;

CREATE UNIQUE INDEX idx_unique_role_per_user_org
ON role_assignments (user_id, role, COALESCE(organization_id::text, '__GLOBAL__'));
```

---

### STEP 3: Auto-Create Profile Trigger

```sql
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
DECLARE
  default_display_name TEXT;
  yr_org_id UUID;
BEGIN
  default_display_name := SPLIT_PART(NEW.email, '@', 1);
  SELECT id INTO yr_org_id FROM organizations WHERE slug = 'yr-inmobiliaria';

  INSERT INTO public.profiles (user_id, email, display_name, is_complete, email_verified, created_at, updated_at)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', default_display_name), false, COALESCE(NEW.email_confirmed_at IS NOT NULL, false), NOW(), NOW())
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

### STEP 4: Add Foreign Key

```sql
ALTER TABLE role_assignments
ADD CONSTRAINT fk_role_assignments_profiles
FOREIGN KEY (user_id) REFERENCES profiles(user_id)
ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
```

---

### STEP 5: Sync Email Trigger

```sql
CREATE OR REPLACE FUNCTION sync_user_email() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles SET email = NEW.email, updated_at = NOW() WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_email_changed ON auth.users;
CREATE TRIGGER on_auth_user_email_changed AFTER UPDATE ON auth.users
FOR EACH ROW WHEN (OLD.email IS DISTINCT FROM NEW.email) EXECUTE FUNCTION sync_user_email();
```

---

## ✅ FINAL VERIFICATION

```sql
-- All should return expected results:
SELECT COUNT(*) FROM role_assignments ra LEFT JOIN profiles p ON ra.user_id = p.user_id WHERE p.user_id IS NULL; -- Expected: 0
SELECT COUNT(*) FROM role_assignments ra JOIN auth.users u ON ra.user_id = u.id WHERE u.email = 'carlo.spada22@gmail.com' AND ra.role = 'superadmin'; -- Expected: 1
SELECT trigger_name FROM information_schema.triggers WHERE trigger_name IN ('on_auth_user_created', 'on_auth_user_email_changed'); -- Expected: 2 rows
```

---

## 🎯 WHAT THIS FIXES

**Before:**
- Carlo has 2 superadmin roles (duplicate)
- Cannot JOIN role_assignments with profiles
- Profiles created inconsistently
- Emails can get out of sync

**After:**
- Carlo has 1 superadmin role
- Can JOIN directly in SQL
- Profiles auto-created on signup
- Emails stay synced automatically

---

## 📞 AFTER MIGRATION

1. ✅ Confirm all verification queries pass
2. ✅ Test signup with new user
3. ✅ I'll update AdminUsers.tsx to use JOIN
4. ✅ **DELETE THIS FILE** (no longer needed)

---

**Execute in Lovable SQL Editor now!** 🚀
