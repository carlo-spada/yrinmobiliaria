-- Function to check and grant admin role to specific emails on signup
-- This runs automatically when users sign up
CREATE OR REPLACE FUNCTION public.grant_admin_to_specific_emails()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the new user's email is in the admin list
  IF NEW.email IN ('ruizvasquezyazmin@gmail.com', 'carlo.spada22@gmail.com') THEN
    -- Grant admin role (in addition to any other role they might have)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to grant admin to specific emails on signup
DROP TRIGGER IF EXISTS on_auth_user_created_grant_specific_admins ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_specific_admins
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_admin_to_specific_emails();

-- Also grant admin to these users if they already exist
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email IN ('ruizvasquezyazmin@gmail.com', 'carlo.spada22@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- Create a secure function for admins to promote users
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can promote users';
  END IF;
  
  -- Grant admin role to target user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Create a function to get user email by ID (for admin use)
CREATE OR REPLACE FUNCTION public.get_user_email(target_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can view user emails';
  END IF;
  
  -- Get user email from auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = target_user_id;
  
  RETURN user_email;
END;
$$;