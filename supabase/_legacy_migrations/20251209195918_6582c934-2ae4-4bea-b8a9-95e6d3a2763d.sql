-- Fix profiles UPDATE policy with proper WITH CHECK expression
DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
CREATE POLICY "Users can update profiles" ON public.profiles
FOR UPDATE
USING (
  (user_id = auth.uid())
  OR is_superadmin(auth.uid())
  OR (is_admin(auth.uid()) AND (organization_id = get_user_org_id(auth.uid())))
)
WITH CHECK (
  (user_id = auth.uid())
  OR is_superadmin(auth.uid())
  OR (is_admin(auth.uid()) AND (organization_id = get_user_org_id(auth.uid())))
);

-- Fix properties policy - add explicit WITH CHECK for all operations
DROP POLICY IF EXISTS "Staff can manage properties" ON public.properties;
CREATE POLICY "Staff can manage properties" ON public.properties
FOR ALL
USING (
  is_superadmin(auth.uid())
  OR (is_admin(auth.uid()) AND (organization_id = get_user_org_id(auth.uid())))
  OR (agent_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
)
WITH CHECK (
  is_superadmin(auth.uid())
  OR (is_admin(auth.uid()) AND (organization_id = get_user_org_id(auth.uid())))
  OR (agent_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);