-- FIX 1: Allow public read access to site_settings
-- Settings should be readable by everyone, but only writable by admins

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Admins can view site settings" ON public.site_settings;

-- Create new policy allowing everyone to read
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);  -- Everyone can read

-- Admin-only policies for write operations remain unchanged
-- (INSERT, UPDATE, DELETE still require admin role)


-- FIX 2: Add image_url column to service_zones table
ALTER TABLE public.service_zones
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment
COMMENT ON COLUMN public.service_zones.image_url IS 'URL de la imagen de la zona (puede ser Supabase Storage o externa)';
