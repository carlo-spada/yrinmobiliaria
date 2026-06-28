-- Fix promote_user_to_admin to use role_assignments table
-- This replaces the old function that used the obsolete user_roles table

CREATE OR REPLACE FUNCTION public.promote_user_to_admin(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_org_id uuid;
  caller_role text;
BEGIN
  -- Check if caller is admin or superadmin
  IF NOT EXISTS (
    SELECT 1 FROM public.role_assignments
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  ) THEN
    RAISE EXCEPTION 'Only admins can promote users';
  END IF;

  -- Get the target user's organization from their profile
  SELECT organization_id INTO target_org_id
  FROM public.profiles
  WHERE user_id = target_user_id;

  IF target_org_id IS NULL THEN
    RAISE EXCEPTION 'Target user must belong to an organization to be promoted';
  END IF;

  -- Insert admin role into role_assignments
  INSERT INTO public.role_assignments (user_id, role, organization_id)
  VALUES (target_user_id, 'admin', target_org_id)
  ON CONFLICT (user_id, role, organization_id) DO NOTHING;
  
  -- Also ensure they have an agent profile if they don't (admins are implicitly agents)
  UPDATE public.profiles
  SET agent_level = COALESCE(agent_level, 'agent')
  WHERE user_id = target_user_id;

END;
$$;
