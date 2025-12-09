-- Drop the view approach - it won't work with restrictive RLS
DROP VIEW IF EXISTS public.public_agent_directory;

-- Create a security definer function that returns only non-sensitive fields
-- This safely exposes public agent data without exposing PII
CREATE OR REPLACE FUNCTION public.get_public_agents()
RETURNS TABLE (
  id uuid,
  display_name text,
  photo_url text,
  bio_es text,
  bio_en text,
  agent_level public.agent_level,
  agent_years_experience integer,
  agent_specialty text[],
  languages text[],
  service_zones text[],
  is_featured boolean,
  organization_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
    AND is_complete = true
  ORDER BY is_featured DESC, display_name ASC;
$$;

-- Create a function to get a single agent's public profile by id
CREATE OR REPLACE FUNCTION public.get_public_agent_by_id(_agent_id uuid)
RETURNS TABLE (
  id uuid,
  display_name text,
  photo_url text,
  bio_es text,
  bio_en text,
  agent_level public.agent_level,
  agent_years_experience integer,
  agent_specialty text[],
  languages text[],
  service_zones text[],
  is_featured boolean,
  organization_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
  WHERE id = _agent_id
    AND is_active = true 
    AND show_in_directory = true 
    AND is_complete = true;
$$;

-- Grant execute permissions to public
GRANT EXECUTE ON FUNCTION public.get_public_agents() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_agent_by_id(uuid) TO anon, authenticated;