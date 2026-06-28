-- Create a function that allows superadmins to be treated as part of any org they're managing
-- This is useful for operations that need org context even for superadmins

-- First, let's ensure the role_assignments table has proper org context for admins
-- For superadmins, they can operate on any org, so we don't need to change get_user_org_id

-- However, let's add a helper function that checks if a user can manage an org
CREATE OR REPLACE FUNCTION public.can_manage_org(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- Superadmins can manage any org
    is_superadmin(_user_id)
    -- Org admins can manage their own org
    OR (is_admin(_user_id) AND get_user_org_id(_user_id) = _org_id)
    -- Users in the org with agent role can manage properties
    OR EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = _user_id 
      AND p.organization_id = _org_id
      AND p.agent_level IS NOT NULL
    )
$$;