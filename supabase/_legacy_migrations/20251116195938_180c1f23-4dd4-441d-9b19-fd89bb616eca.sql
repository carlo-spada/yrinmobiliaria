-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Allow anyone to view images (public bucket)
CREATE POLICY "Public access to property images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

-- Only admins can upload images
CREATE POLICY "Admins can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-images' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Only admins can update images
CREATE POLICY "Admins can update property images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-images' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Only admins can delete images
CREATE POLICY "Admins can delete property images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images' AND
  has_role(auth.uid(), 'admin'::app_role)
);