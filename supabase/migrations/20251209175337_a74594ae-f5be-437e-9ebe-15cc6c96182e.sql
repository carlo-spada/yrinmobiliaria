-- Fix the is_superadmin function to check role_assignments table instead of profiles
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.role_assignments 
    WHERE user_id = _user_id AND role = 'superadmin'
  )
$$;