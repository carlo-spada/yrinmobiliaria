-- Verify and create property-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and agents can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and agents can delete property images" ON storage.objects;

-- Recreate policies with role_assignments + agent profile checks
CREATE POLICY "Public can view property images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

CREATE POLICY "Admins and agents can upload property images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-images'
  AND (
    EXISTS (
      SELECT 1 FROM public.role_assignments ra 
      WHERE ra.user_id = auth.uid() 
      AND ra.role IN ('admin', 'superadmin')
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.agent_level IS NOT NULL 
      AND p.organization_id IS NOT NULL
    )
  )
);

CREATE POLICY "Admins can update property images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'property-images'
  AND (
    EXISTS (
      SELECT 1 FROM public.role_assignments ra 
      WHERE ra.user_id = auth.uid() 
      AND ra.role IN ('admin', 'superadmin')
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.agent_level IS NOT NULL 
      AND p.organization_id IS NOT NULL
    )
  )
);

CREATE POLICY "Admins and agents can delete property images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-images'
  AND (
    EXISTS (
      SELECT 1 FROM public.role_assignments ra 
      WHERE ra.user_id = auth.uid() 
      AND ra.role IN ('admin', 'superadmin')
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.agent_level IS NOT NULL 
      AND p.organization_id IS NOT NULL
    )
  )
);