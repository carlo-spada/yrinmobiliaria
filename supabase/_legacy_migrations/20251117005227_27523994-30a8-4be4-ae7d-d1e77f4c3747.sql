-- Add image_url column to service_zones table
ALTER TABLE public.service_zones
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.service_zones.image_url IS 'URL of the zone image stored in Supabase Storage or external URL';