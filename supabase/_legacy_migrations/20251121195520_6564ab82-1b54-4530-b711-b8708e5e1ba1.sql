-- Drop existing storage policies for property-images bucket
DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and agents can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete property images" ON storage.objects;

-- Recreate storage policies with correct table reference to role_assignments
CREATE POLICY "Public can view property images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'property-images');

CREATE POLICY "Admins and agents can upload property images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'property-images'
  AND EXISTS (
    SELECT 1 FROM public.role_assignments ra
    WHERE ra.user_id = auth.uid()
    AND ra.role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admins can update property images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'property-images'
  AND EXISTS (
    SELECT 1 FROM public.role_assignments ra
    WHERE ra.user_id = auth.uid()
    AND ra.role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admins can delete property images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'property-images'
  AND EXISTS (
    SELECT 1 FROM public.role_assignments ra
    WHERE ra.user_id = auth.uid()
    AND ra.role IN ('admin', 'superadmin')
  )
);