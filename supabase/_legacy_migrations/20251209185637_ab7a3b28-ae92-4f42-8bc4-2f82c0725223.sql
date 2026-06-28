-- Drop existing functions first since return type is changing
DROP FUNCTION IF EXISTS public.get_public_agents();
DROP FUNCTION IF EXISTS public.get_public_agent_by_id(uuid);

-- Recreate get_public_agents without whatsapp_number (contact details restricted)
CREATE FUNCTION public.get_public_agents()
RETURNS TABLE(
  id uuid,
  display_name text,
  photo_url text,
  bio_es text,
  bio_en text,
  agent_level agent_level,
  agent_years_experience integer,
  agent_license_number text,
  agent_specialty text[],
  languages text[],
  service_zones text[],
  is_featured boolean,
  organization_id uuid,
  instagram_handle text,
  linkedin_url text,
  facebook_url text
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
    agent_license_number,
    agent_specialty,
    languages,
    service_zones,
    is_featured,
    organization_id,
    instagram_handle,
    linkedin_url,
    facebook_url
  FROM public.profiles
  WHERE is_active = true 
    AND show_in_directory = true 
    AND is_complete = true
  ORDER BY is_featured DESC, display_name ASC;
$$;

-- Recreate get_public_agent_by_id without whatsapp_number
CREATE FUNCTION public.get_public_agent_by_id(_agent_id uuid)
RETURNS TABLE(
  id uuid,
  display_name text,
  photo_url text,
  bio_es text,
  bio_en text,
  agent_level agent_level,
  agent_years_experience integer,
  agent_license_number text,
  agent_specialty text[],
  languages text[],
  service_zones text[],
  is_featured boolean,
  organization_id uuid,
  instagram_handle text,
  linkedin_url text,
  facebook_url text
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
    agent_license_number,
    agent_specialty,
    languages,
    service_zones,
    is_featured,
    organization_id,
    instagram_handle,
    linkedin_url,
    facebook_url
  FROM public.profiles
  WHERE id = _agent_id
    AND is_active = true 
    AND show_in_directory = true 
    AND is_complete = true;
$$;