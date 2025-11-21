-- Fix property-images storage policies to include agents
-- Drop existing policies
DROP POLICY IF EXISTS "Admins and agents can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete property images" ON storage.objects;

-- Recreate policies with proper agent support
-- Agents are identified by having agent_level in their profile

-- Upload policy: admins, superadmins, and agents can upload
CREATE POLICY "Admins and agents can upload property images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'property-images'
  AND (
    -- Check for admin/superadmin role
    EXISTS (
      SELECT 1 FROM public.role_assignments ra
      WHERE ra.user_id = auth.uid()
      AND ra.role IN ('admin', 'superadmin')
    )
    OR
    -- Check for agent (has agent_level in profile)
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.agent_level IS NOT NULL
      AND p.organization_id IS NOT NULL
    )
  )
);

-- Update policy: admins, superadmins, and agents can update
CREATE POLICY "Admins and agents can update property images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'property-images'
  AND (
    EXISTS (
      SELECT 1 FROM public.role_assignments ra
      WHERE ra.user_id = auth.uid()
      AND ra.role IN ('admin', 'superadmin')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.agent_level IS NOT NULL
      AND p.organization_id IS NOT NULL
    )
  )
);

-- Delete policy: admins, superadmins, and agents can delete
CREATE POLICY "Admins and agents can delete property images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'property-images'
  AND (
    EXISTS (
      SELECT 1 FROM public.role_assignments ra
      WHERE ra.user_id = auth.uid()
      AND ra.role IN ('admin', 'superadmin')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.agent_level IS NOT NULL
      AND p.organization_id IS NOT NULL
    )
  )
);