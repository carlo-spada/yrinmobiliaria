-- Fix the security definer view issue by explicitly setting SECURITY INVOKER
-- This ensures the view uses the permissions of the querying user, not the creator

DROP VIEW IF EXISTS public.public_agent_directory;

CREATE VIEW public.public_agent_directory 
WITH (security_invoker = true)
AS
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