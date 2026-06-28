-- Fix role_assignments to allow global superadmin (NULL org)
-- Drop the problematic constraint if it exists
ALTER TABLE public.role_assignments 
DROP CONSTRAINT IF EXISTS role_assignments_org_required_for_staff;

-- Ensure RLS is enabled
ALTER TABLE public.role_assignments ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policy for viewing own roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.role_assignments;
DROP POLICY IF EXISTS "Users can view own role assignments" ON public.role_assignments;

CREATE POLICY "Users can view their own roles"
ON public.role_assignments
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Clean up and restore Carlo's superadmin access
DO $$
DECLARE
  carlo_user_id UUID;
  yr_org_id UUID;
BEGIN
  -- Get Carlo's user ID
  SELECT id INTO carlo_user_id FROM auth.users WHERE email = 'carlo.spada22@gmail.com';
  
  -- Get YR Inmobiliaria org ID
  SELECT id INTO yr_org_id FROM organizations WHERE slug = 'yr-inmobiliaria';

  IF carlo_user_id IS NOT NULL THEN
    -- Delete any existing superadmin roles (wrong or right)
    DELETE FROM public.role_assignments 
    WHERE user_id = carlo_user_id AND role = 'superadmin';
    
    -- Delete admin roles for wrong orgs
    DELETE FROM public.role_assignments 
    WHERE user_id = carlo_user_id 
    AND role = 'admin' 
    AND organization_id != yr_org_id;

    -- Insert correct global superadmin role (NULL org for global access)
    INSERT INTO public.role_assignments (user_id, organization_id, role, granted_at)
    VALUES (carlo_user_id, NULL, 'superadmin', NOW());
    
    -- Ensure admin role for YR Inmobiliaria
    INSERT INTO public.role_assignments (user_id, organization_id, role, granted_at)
    VALUES (carlo_user_id, yr_org_id, 'admin', NOW())
    ON CONFLICT (user_id, role, organization_id) DO NOTHING;
  END IF;
END $$;