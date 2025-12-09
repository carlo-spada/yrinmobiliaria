-- Add INSERT policy for property_images - allow admins and agents to add images
CREATE POLICY "Staff can insert property images"
ON public.property_images
FOR INSERT
WITH CHECK (
  -- Check if user can manage the property this image belongs to
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id
    AND (
      is_superadmin(auth.uid())
      OR (is_admin(auth.uid()) AND p.organization_id = get_user_org_id(auth.uid()))
      OR p.agent_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  )
);

-- Add UPDATE policy for property_images
CREATE POLICY "Staff can update property images"
ON public.property_images
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id
    AND (
      is_superadmin(auth.uid())
      OR (is_admin(auth.uid()) AND p.organization_id = get_user_org_id(auth.uid()))
      OR p.agent_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  )
);

-- Add DELETE policy for property_images
CREATE POLICY "Staff can delete property images"
ON public.property_images
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id
    AND (
      is_superadmin(auth.uid())
      OR (is_admin(auth.uid()) AND p.organization_id = get_user_org_id(auth.uid()))
      OR p.agent_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  )
);