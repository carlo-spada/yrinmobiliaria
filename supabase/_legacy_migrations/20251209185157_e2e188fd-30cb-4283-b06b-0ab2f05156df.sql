-- Create a security definer function to return only public-safe organization data
-- This prevents exposure of sensitive business fields like commission_rate, billing_status, subscription_plan

CREATE OR REPLACE FUNCTION public.get_public_organization(_org_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  slug text,
  domain text,
  contact_email text,
  phone text,
  logo_url text,
  brand_colors jsonb,
  is_active boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    name,
    slug,
    domain,
    contact_email,
    phone,
    logo_url,
    brand_colors,
    is_active
  FROM public.organizations
  WHERE id = _org_id AND is_active = true;
$$;

-- Create a function to get all active public organizations (without sensitive data)
CREATE OR REPLACE FUNCTION public.get_public_organizations()
RETURNS TABLE(
  id uuid,
  name text,
  slug text,
  domain text,
  contact_email text,
  phone text,
  logo_url text,
  brand_colors jsonb,
  is_active boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    name,
    slug,
    domain,
    contact_email,
    phone,
    logo_url,
    brand_colors,
    is_active
  FROM public.organizations
  WHERE is_active = true
  ORDER BY name ASC;
$$;

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view active organizations" ON public.organizations;

-- Create a more restrictive SELECT policy - only admins/superadmins can see full org data
CREATE POLICY "Admins can view organizations" 
ON public.organizations 
FOR SELECT 
USING (
  is_superadmin(auth.uid()) 
  OR (is_admin(auth.uid()) AND id = get_user_org_id(auth.uid()))
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.organization_id = organizations.id
  )
);