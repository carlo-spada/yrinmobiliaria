-- Add UPDATE policy for property images storage
CREATE POLICY "Authenticated users can update property images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'property-images' 
  AND auth.uid() IS NOT NULL
);

-- Add DELETE policy for property images storage  
CREATE POLICY "Authenticated users can delete property images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'property-images' 
  AND auth.uid() IS NOT NULL
);