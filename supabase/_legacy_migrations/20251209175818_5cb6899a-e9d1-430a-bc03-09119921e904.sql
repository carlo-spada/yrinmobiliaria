-- SCHEMA SIMPLIFICATION: Remove users table, consolidate roles
-- Step 1: Create helper function to check admin status using role_assignments + profiles

CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.role_assignments ra
    WHERE ra.user_id = _user_id 
    AND ra.role IN ('admin', 'superadmin')
  ) AND (
    -- Either superadmin (no org restriction) or admin in the same org
    public.is_superadmin(_user_id) 
    OR EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = _user_id AND p.organization_id = _org_id
    )
  )
$$;

-- Step 2: Create function to get user's organization from profiles
CREATE OR REPLACE FUNCTION public.get_user_org_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT organization_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Step 3: Create function to check if user is admin (any org)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.role_assignments
    WHERE user_id = _user_id AND role IN ('admin', 'superadmin')
  )
$$;

-- Step 4: Drop old policies that reference users table

-- agent_invitations
DROP POLICY IF EXISTS "Admins can manage org invitations" ON public.agent_invitations;

-- audit_logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

-- cms_pages
DROP POLICY IF EXISTS "Admins and superadmins can manage cms_pages" ON public.cms_pages;

-- contact_inquiries
DROP POLICY IF EXISTS "Admins can manage org inquiries" ON public.contact_inquiries;

-- entity_definitions
DROP POLICY IF EXISTS "Superadmin write entity defs" ON public.entity_definitions;

-- field_definitions
DROP POLICY IF EXISTS "Superadmin write field defs" ON public.field_definitions;

-- profiles
DROP POLICY IF EXISTS "Admins can insert org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view org profiles" ON public.profiles;

-- properties
DROP POLICY IF EXISTS "Admins can delete org properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can insert org properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can update org properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can view org properties" ON public.properties;

-- scheduled_visits
DROP POLICY IF EXISTS "Admins can manage org visits" ON public.scheduled_visits;

-- service_zones
DROP POLICY IF EXISTS "Admins can delete service zones" ON public.service_zones;
DROP POLICY IF EXISTS "Admins can insert service zones" ON public.service_zones;
DROP POLICY IF EXISTS "Admins can update service zones" ON public.service_zones;

-- site_settings
DROP POLICY IF EXISTS "Admins can delete site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can insert site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;

-- Step 5: Create new policies using helper functions

-- agent_invitations
CREATE POLICY "Admins can manage org invitations" ON public.agent_invitations
FOR ALL USING (
  public.is_superadmin(auth.uid()) 
  OR (public.is_admin(auth.uid()) AND organization_id = public.get_user_org_id(auth.uid()))
);

-- audit_logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
FOR SELECT USING (public.is_admin(auth.uid()));

-- cms_pages
CREATE POLICY "Admins and superadmins can manage cms_pages" ON public.cms_pages
FOR ALL USING (
  public.is_superadmin(auth.uid()) 
  OR (public.is_admin(auth.uid()) AND organization_id = public.get_user_org_id(auth.uid()))
);

-- contact_inquiries
CREATE POLICY "Admins can manage org inquiries" ON public.contact_inquiries
FOR ALL USING (
  public.is_superadmin(auth.uid()) 
  OR (public.is_admin(auth.uid()) AND organization_id = public.get_user_org_id(auth.uid()))
);

-- entity_definitions
CREATE POLICY "Superadmin write entity defs" ON public.entity_definitions
FOR ALL USING (public.is_superadmin(auth.uid()));

-- field_definitions
CREATE POLICY "Superadmin write field defs" ON public.field_definitions
FOR ALL USING (public.is_superadmin(auth.uid()));

-- profiles
CREATE POLICY "Admins can insert org profiles" ON public.profiles
FOR INSERT WITH CHECK (
  public.is_superadmin(auth.uid()) 
  OR (public.is_admin(auth.uid()) AND organization_id = public.get_user_org_id(auth.uid()))
);

CREATE POLICY "Admins can update org profiles" ON public.profiles
FOR UPDATE USING (
  public.is_superadmin(auth.uid()) 
  OR (public.is_admin(auth.uid()) AND organization_id = public.get_user_org_id(auth.uid()))
);

CREATE POLICY "Admins can view org profiles" ON public.profiles
FOR SELECT USING (
  public.is_superadmin(auth.uid()) 
  OR (public.is_admin(auth.uid()) AND organization_id = public.get_user_org_id(auth.uid()))
);

-- properties
CREATE POLICY "Admins can manage org properties" ON public.properties
FOR ALL USING (
  public.is_superadmin(auth.uid()) 
  OR (public.is_admin(auth.uid()) AND organization_id = public.get_user_org_id(auth.uid()))
  OR agent_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- scheduled_visits
CREATE POLICY "Admins can manage org visits" ON public.scheduled_visits
FOR ALL USING (
  public.is_superadmin(auth.uid()) 
  OR (public.is_admin(auth.uid()) AND organization_id = public.get_user_org_id(auth.uid()))
);

-- service_zones
CREATE POLICY "Admins can manage service zones" ON public.service_zones
FOR ALL USING (public.is_admin(auth.uid()));

-- site_settings
CREATE POLICY "Admins can manage site settings" ON public.site_settings
FOR ALL USING (public.is_admin(auth.uid()));

-- Step 6: Drop redundant bio column from profiles (keep bio_es and bio_en)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS bio;

-- Step 7: Drop users table policies first
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "superadmin_update_user_org" ON public.users;
DROP POLICY IF EXISTS "superadmin_view_all" ON public.users;
DROP POLICY IF EXISTS "update_own_user" ON public.users;
DROP POLICY IF EXISTS "view_own_user" ON public.users;

-- Step 8: Drop users table
DROP TABLE IF EXISTS public.users;

-- Step 9: Drop the user_role enum (no longer needed)
DROP TYPE IF EXISTS public.user_role;