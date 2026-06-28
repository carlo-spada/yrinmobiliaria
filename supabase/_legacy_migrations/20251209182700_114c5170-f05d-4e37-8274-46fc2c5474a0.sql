-- Update the public agents function to include social media links (public by nature)
-- and WhatsApp (typically a business number for real estate agents)
-- Keep personal email and phone protected

DROP FUNCTION IF EXISTS public.get_public_agents();
DROP FUNCTION IF EXISTS public.get_public_agent_by_id(uuid);

-- Create updated function with social media included
CREATE OR REPLACE FUNCTION public.get_public_agents()
RETURNS TABLE (
  id uuid,
  display_name text,
  photo_url text,
  bio_es text,
  bio_en text,
  agent_level public.agent_level,
  agent_years_experience integer,
  agent_license_number text,
  agent_specialty text[],
  languages text[],
  service_zones text[],
  is_featured boolean,
  organization_id uuid,
  -- Social links are public by nature
  instagram_handle text,
  linkedin_url text,
  facebook_url text,
  whatsapp_number text
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
    facebook_url,
    whatsapp_number
  FROM public.profiles
  WHERE is_active = true 
    AND show_in_directory = true 
    AND is_complete = true
  ORDER BY is_featured DESC, display_name ASC;
$$;

-- Create function to get single agent by id
CREATE OR REPLACE FUNCTION public.get_public_agent_by_id(_agent_id uuid)
RETURNS TABLE (
  id uuid,
  display_name text,
  photo_url text,
  bio_es text,
  bio_en text,
  agent_level public.agent_level,
  agent_years_experience integer,
  agent_license_number text,
  agent_specialty text[],
  languages text[],
  service_zones text[],
  is_featured boolean,
  organization_id uuid,
  instagram_handle text,
  linkedin_url text,
  facebook_url text,
  whatsapp_number text
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
    facebook_url,
    whatsapp_number
  FROM public.profiles
  WHERE id = _agent_id
    AND is_active = true 
    AND show_in_directory = true 
    AND is_complete = true;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_public_agents() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_agent_by_id(uuid) TO anon, authenticated;