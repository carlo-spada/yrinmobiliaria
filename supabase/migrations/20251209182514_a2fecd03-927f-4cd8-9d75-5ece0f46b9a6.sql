-- Create a secure view for public agent directory that only exposes non-sensitive fields
-- This prevents PII exposure (email, phone, whatsapp) to unauthenticated users

CREATE OR REPLACE VIEW public.public_agent_directory AS
SELECT 
  id,
  display_name,
  photo_url,
  bio_es,
  bio_en,
  agent_level,
  agent_years_experience,
  agent_specialty,
  languages,
  service_zones,
  is_featured,
  organization_id
FROM public.profiles
WHERE is_active = true 
  AND show_in_directory = true 
  AND is_complete = true;

-- Grant public access to the view
GRANT SELECT ON public.public_agent_directory TO anon, authenticated;

-- Now update the profiles table RLS policy to restrict public access
-- First, drop the overly permissive policy
DROP POLICY IF EXISTS "Public can view directory profiles" ON public.profiles;

-- Create a new restrictive policy - only authenticated users can see full profile details
CREATE POLICY "Authenticated users can view directory profiles" 
ON public.profiles 
FOR SELECT 
USING (
  -- User can see their own profile
  (user_id = auth.uid())
  -- Or user is viewing a public directory profile while authenticated
  OR (show_in_directory = true AND is_active = true AND auth.uid() IS NOT NULL)
  -- Or user is an admin/superadmin (existing policies cover this, but explicit is clearer)
  OR is_superadmin(auth.uid())
  OR (is_admin(auth.uid()) AND organization_id = get_user_org_id(auth.uid()))
);