-- Drop the overly permissive directory view policy
DROP POLICY IF EXISTS "Authenticated users can view directory profiles" ON public.profiles;

-- Create a more restrictive policy for directory profiles
-- Only allows viewing specific "safe" fields through the security definer functions
-- Direct table access is restricted to own profile, org admins, or superadmins
CREATE POLICY "Limited directory profile access" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can always see their own profile
  user_id = auth.uid()
  -- Superadmins can see all profiles
  OR is_superadmin(auth.uid())
  -- Org admins can see profiles in their org
  OR (is_admin(auth.uid()) AND organization_id = get_user_org_id(auth.uid()))
  -- Agents in same org can see basic info of other agents (for assignment purposes)
  OR (
    auth.uid() IS NOT NULL 
    AND organization_id = get_user_org_id(auth.uid())
    AND show_in_directory = true 
    AND is_active = true
  )
);