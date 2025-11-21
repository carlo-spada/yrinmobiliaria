-- Step 1: Clean up duplicate role assignments
-- Keep only the most recent role assignment for each (user_id, role, organization_id) combination
WITH duplicates AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY user_id, role, COALESCE(organization_id::text, '__GLOBAL__')
    ORDER BY granted_at DESC NULLS LAST, created_at DESC NULLS LAST
  ) as row_num 
  FROM role_assignments
)
DELETE FROM role_assignments 
WHERE id IN (SELECT id FROM duplicates WHERE row_num > 1);

-- Step 2: Drop old UNIQUE constraint and create new unique index
-- This prevents duplicate roles even when organization_id is NULL
ALTER TABLE role_assignments DROP CONSTRAINT IF EXISTS role_assignments_user_id_organization_id_role_key;
ALTER TABLE role_assignments DROP CONSTRAINT IF EXISTS role_assignments_user_id_role_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_role_per_user_org
ON role_assignments (user_id, role, COALESCE(organization_id::text, '__GLOBAL__'));

-- Step 3: Create trigger function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
DECLARE
  default_display_name TEXT;
  yr_org_id UUID;
BEGIN
  -- Generate default display name from email prefix
  default_display_name := SPLIT_PART(NEW.email, '@', 1);
  
  -- Get YR Inmobiliaria organization ID
  SELECT id INTO yr_org_id FROM organizations WHERE slug = 'yr-inmobiliaria';

  -- Create profile for new user
  INSERT INTO public.profiles (user_id, email, display_name, is_complete, email_verified, created_at, updated_at)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', default_display_name),
    false, 
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false), 
    NOW(), 
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Assign default 'user' role
  INSERT INTO public.role_assignments (user_id, role, granted_at)
  VALUES (NEW.id, 'user', NOW()) 
  ON CONFLICT DO NOTHING;

  -- Auto-assign superadmin role to Carlo (global, NULL organization)
  IF NEW.email = 'carlo.spada22@gmail.com' THEN
    INSERT INTO public.role_assignments (user_id, organization_id, role, granted_at)
    VALUES (NEW.id, NULL, 'superadmin', NOW()) 
    ON CONFLICT DO NOTHING;
  
  -- Auto-assign admin role to Yas (YR Inmobiliaria organization)
  ELSIF NEW.email = 'ruizvasquezyazmin@gmail.com' AND yr_org_id IS NOT NULL THEN
    INSERT INTO public.role_assignments (user_id, organization_id, role, granted_at)
    VALUES (NEW.id, yr_org_id, 'admin', NOW()) 
    ON CONFLICT DO NOTHING;
    
    -- Set organization on profile
    UPDATE public.profiles 
    SET organization_id = yr_org_id, updated_at = NOW() 
    WHERE user_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created 
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION handle_new_user();

-- Step 4: Add foreign key constraint from role_assignments to profiles
-- DEFERRABLE INITIALLY DEFERRED allows profile and role creation in same transaction
ALTER TABLE role_assignments
ADD CONSTRAINT fk_role_assignments_profiles
FOREIGN KEY (user_id) REFERENCES profiles(user_id)
ON DELETE CASCADE
DEFERRABLE INITIALLY DEFERRED;

-- Step 5: Create email sync trigger to keep profiles.email in sync with auth.users.email
CREATE OR REPLACE FUNCTION sync_user_email() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles 
    SET email = NEW.email, updated_at = NOW() 
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for email changes
DROP TRIGGER IF EXISTS on_auth_user_email_changed ON auth.users;
CREATE TRIGGER on_auth_user_email_changed 
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION sync_user_email();