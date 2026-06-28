-- Update all RLS policies to use users.role instead of profiles.role
-- This is required before we can drop the role column from profiles

-- 1. Drop all policies that reference profiles.role
DROP POLICY IF EXISTS "Admins can view org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view org properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can insert org properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can update org properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can delete org properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can manage org inquiries" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Admins can manage org visits" ON public.scheduled_visits;
DROP POLICY IF EXISTS "Admins can manage org invitations" ON public.agent_invitations;
DROP POLICY IF EXISTS "Admins can insert service zones" ON public.service_zones;
DROP POLICY IF EXISTS "Admins can update service zones" ON public.service_zones;
DROP POLICY IF EXISTS "Admins can delete service zones" ON public.service_zones;
DROP POLICY IF EXISTS "Admins can insert site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can delete site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins and superadmins can manage cms_pages" ON public.cms_pages;
DROP POLICY IF EXISTS "Superadmin write entity defs" ON public.entity_definitions;
DROP POLICY IF EXISTS "Superadmin write field defs" ON public.field_definitions;

-- 2. Recreate policies using users.role
CREATE POLICY "Admins can view org profiles" ON public.profiles
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can insert org profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update org profiles" ON public.profiles
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can view org properties" ON public.properties
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    ) OR agent_id IN (
      SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert org properties" ON public.properties
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update org properties" ON public.properties
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    ) OR agent_id IN (
      SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    ) OR agent_id IN (
      SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete org properties" ON public.properties
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can manage org inquiries" ON public.contact_inquiries
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can manage org visits" ON public.scheduled_visits
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can manage org invitations" ON public.agent_invitations
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can insert service zones" ON public.service_zones
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update service zones" ON public.service_zones
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can delete service zones" ON public.service_zones
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can insert site settings" ON public.site_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update site settings" ON public.site_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can delete site settings" ON public.site_settings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins and superadmins can manage cms_pages" ON public.cms_pages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.profiles p ON p.user_id = u.id
      WHERE u.id = auth.uid() 
        AND p.organization_id = cms_pages.organization_id 
        AND u.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Superadmin write entity defs" ON public.entity_definitions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Superadmin write field defs" ON public.field_definitions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- 3. Now drop the role column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;