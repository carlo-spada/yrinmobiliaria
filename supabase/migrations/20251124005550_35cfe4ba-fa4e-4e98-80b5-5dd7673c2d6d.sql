-- Allow superadmins to update user organizations
-- This policy allows superadmins to assign organizations to any user

DROP POLICY IF EXISTS "superadmin_update_all" ON public.users;

CREATE POLICY "superadmin_update_user_org"
ON public.users
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'superadmin'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'superadmin'::app_role)
);

-- Allow superadmins to update profile organizations
DROP POLICY IF EXISTS "Admins can update org profiles" ON public.profiles;

CREATE POLICY "Admins can update org profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT users.organization_id
    FROM users
    WHERE users.id = auth.uid()
    AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
  )
  OR public.has_role(auth.uid(), 'superadmin'::app_role)
)
WITH CHECK (
  organization_id IN (
    SELECT users.organization_id
    FROM users
    WHERE users.id = auth.uid()
    AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
  )
  OR public.has_role(auth.uid(), 'superadmin'::app_role)
);