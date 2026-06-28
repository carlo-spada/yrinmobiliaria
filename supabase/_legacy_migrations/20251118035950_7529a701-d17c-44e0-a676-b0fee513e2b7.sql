-- Add database constraints for input validation
-- These provide an additional security layer beyond application validation

-- Contact inquiries constraints
ALTER TABLE public.contact_inquiries
  ADD CONSTRAINT contact_inquiries_name_length CHECK (length(name) >= 1 AND length(name) <= 100),
  ADD CONSTRAINT contact_inquiries_email_length CHECK (length(email) >= 5 AND length(email) <= 255),
  ADD CONSTRAINT contact_inquiries_phone_length CHECK (length(phone) >= 10 AND length(phone) <= 15),
  ADD CONSTRAINT contact_inquiries_message_length CHECK (length(message) >= 10 AND length(message) <= 1200);

-- Scheduled visits constraints
ALTER TABLE public.scheduled_visits
  ADD CONSTRAINT scheduled_visits_name_length CHECK (length(name) >= 1 AND length(name) <= 100),
  ADD CONSTRAINT scheduled_visits_email_length CHECK (length(email) >= 5 AND length(email) <= 255),
  ADD CONSTRAINT scheduled_visits_phone_length CHECK (length(phone) >= 10 AND length(phone) <= 15),
  ADD CONSTRAINT scheduled_visits_message_length CHECK (message IS NULL OR length(message) <= 500);

-- Create function to clean up old temporary storage images
CREATE OR REPLACE FUNCTION public.cleanup_temp_storage_images()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  -- Delete temporary images older than 24 hours
  DELETE FROM storage.objects
  WHERE bucket_id = 'property-images'
    AND name LIKE 'temp/%'
    AND created_at < NOW() - INTERVAL '24 hours';
    
  -- Log the cleanup action
  INSERT INTO public.audit_logs (user_id, action, table_name, changes)
  VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid, -- System user
    'STORAGE_CLEANUP',
    'storage.objects',
    jsonb_build_object(
      'bucket', 'property-images',
      'path_pattern', 'temp/%',
      'timestamp', NOW()
    )
  );
END;
$$;

COMMENT ON FUNCTION public.cleanup_temp_storage_images() IS 'Cleans up temporary storage images older than 24 hours';
