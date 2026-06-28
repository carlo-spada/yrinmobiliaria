-- Grant admin privileges to specific users and setup first-user-admin logic

-- Function to automatically create user role on signup
-- First user gets admin, subsequent users get 'user' role
CREATE OR REPLACE FUNCTION public.auto_create_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count existing user roles
  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  
  -- If this is the first user, make them an admin
  IF user_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role);
  ELSE
    -- Otherwise, assign regular user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user'::app_role);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically assign roles on user creation
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_user_role();

-- Manually grant admin privileges to specific users
-- These inserts will work even if users don't exist yet
-- When they sign up, the trigger will try to insert but ON CONFLICT will prevent duplicates

-- Insert admin role for ruizvasquezyazmin@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'ruizvasquezyazmin@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Insert admin role for carlo.spada22@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'carlo.spada22@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;