-- Flatten Database Architecture: Single Role per User
-- Step 1: Create new user_role enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'agent', 'client', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Drop all RLS policies that depend on profiles.role column
-- Profiles policies
DROP POLICY IF EXISTS "Admins can view org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage org profiles" ON public.profiles;

-- Properties policies
DROP POLICY IF EXISTS "Admins can view org properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can update org properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can insert org properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can delete org properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can manage org properties" ON public.properties;

-- Contact inquiries policies
DROP POLICY IF EXISTS "Admins can manage org inquiries" ON public.contact_inquiries;

-- Scheduled visits policies
DROP POLICY IF EXISTS "Admins can manage org visits" ON public.scheduled_visits;

-- Agent invitations policies
DROP POLICY IF EXISTS "Admins can manage org invitations" ON public.agent_invitations;

-- Service zones policies
DROP POLICY IF EXISTS "Admins can insert service zones" ON public.service_zones;
DROP POLICY IF EXISTS "Admins can update service zones" ON public.service_zones;
DROP POLICY IF EXISTS "Admins can delete service zones" ON public.service_zones;

-- Site settings policies
DROP POLICY IF EXISTS "Admins can insert site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can delete site settings" ON public.site_settings;

-- Audit logs policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

-- CMS pages policies
DROP POLICY IF EXISTS "Admins and superadmins can manage cms_pages" ON public.cms_pages;

-- Step 3: Drop and recreate role column
ALTER TABLE public.profiles DROP COLUMN role CASCADE;
ALTER TABLE public.profiles ADD COLUMN role user_role DEFAULT 'user' NOT NULL;

-- Step 4: Migrate data from role_assignments to profiles.role
WITH ranked_roles AS (
  SELECT 
    user_id,
    role::text as role_text,
    organization_id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id 
      ORDER BY 
        CASE role::text
          WHEN 'superadmin' THEN 1 
          WHEN 'admin' THEN 2 
          ELSE 3 
        END ASC
    ) as rn
  FROM public.role_assignments
)
UPDATE public.profiles p
SET 
  role = (
    CASE rr.role_text
      WHEN 'superadmin' THEN 'superadmin'::user_role
      WHEN 'admin' THEN 'admin'::user_role
      ELSE 'user'::user_role
    END
  ),
  organization_id = COALESCE(p.organization_id, rr.organization_id)
FROM ranked_roles rr
WHERE p.user_id = rr.user_id AND rr.rn = 1;

-- Convert users with agent_level to 'agent' role
UPDATE public.profiles
SET role = 'agent'::user_role
WHERE agent_level IS NOT NULL AND role = 'user'::user_role;

-- Step 5: Drop old tables
DROP TABLE IF EXISTS public.role_assignments CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Step 6: Recreate RLS policies with new enum type
-- Profiles policies
CREATE POLICY "Admins can view org profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin'::user_role, 'superadmin'::user_role)
    )
  );

CREATE POLICY "Admins can insert org profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin'::user_role, 'superadmin'::user_role)
    )
  );

CREATE POLICY "Admins can update org profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin'::user_role, 'superadmin'::user_role)
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin'::user_role, 'superadmin'::user_role)
    )
  );

-- Properties policies
CREATE POLICY "Admins can view org properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin'::user_role, 'superadmin'::user_role)
    ) OR
    agent_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can insert org properties"
  ON public.properties FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin'::user_role, 'superadmin'::user_role)
    )
  );

CREATE POLICY "Admins can update org properties"
  ON public.properties FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin'::user_role, 'superadmin'::user_role)
    ) OR
    agent_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin'::user_role, 'superadmin'::user_role)
    ) OR
    agent_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can delete org properties"
  ON public.properties FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin'::user_role, 'superadmin'::user_role)
    )
  );

-- Contact inquiries policy
CREATE POLICY "Admins can manage org inquiries"
  ON public.contact_inquiries FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin'::user_role, 'superadmin'::user_role)
    )
  );

-- Scheduled visits policy
CREATE POLICY "Admins can manage org visits"
  ON public.scheduled_visits FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin'::user_role, 'superadmin'::user_role)
    )
  );

-- Agent invitations policy
CREATE POLICY "Admins can manage org invitations"
  ON public.agent_invitations FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin'::user_role, 'superadmin'::user_role)
    )
  );

-- Service zones policies
CREATE POLICY "Admins can insert service zones"
  ON public.service_zones FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin'::user_role, 'superadmin'::user_role)
    )
  );

CREATE POLICY "Admins can update service zones"
  ON public.service_zones FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin'::user_role, 'superadmin'::user_role)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin'::user_role, 'superadmin'::user_role)
    )
  );

CREATE POLICY "Admins can delete service zones"
  ON public.service_zones FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin'::user_role, 'superadmin'::user_role)
    )
  );

-- Site settings policies
CREATE POLICY "Admins can insert site settings"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin'::user_role, 'superadmin'::user_role)
    )
  );

CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin'::user_role, 'superadmin'::user_role)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin'::user_role, 'superadmin'::user_role)
    )
  );

CREATE POLICY "Admins can delete site settings"
  ON public.site_settings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin'::user_role, 'superadmin'::user_role)
    )
  );

-- Audit logs policy
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin'::user_role, 'superadmin'::user_role)
    )
  );

-- CMS pages policy
CREATE POLICY "Admins and superadmins can manage cms_pages"
  ON public.cms_pages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() 
        AND p.organization_id = cms_pages.organization_id 
        AND p.role IN ('admin'::user_role, 'superadmin'::user_role)
    )
  );

-- Step 7: Create Dynamic Schema Tables
CREATE TABLE IF NOT EXISTS public.entity_definitions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.field_definitions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_id UUID REFERENCES public.entity_definitions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    label TEXT NOT NULL,
    field_type TEXT NOT NULL,
    options JSONB,
    validation JSONB,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(entity_id, name)
);

ALTER TABLE public.entity_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read entity defs" ON public.entity_definitions FOR SELECT USING (true);
CREATE POLICY "Superadmin write entity defs" ON public.entity_definitions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'superadmin'::user_role)
);

CREATE POLICY "Public read field defs" ON public.field_definitions FOR SELECT USING (true);
CREATE POLICY "Superadmin write field defs" ON public.field_definitions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'superadmin'::user_role)
);

INSERT INTO public.entity_definitions (slug, name) VALUES 
('properties', 'Propiedades'),
('profiles', 'Usuarios')
ON CONFLICT (slug) DO NOTHING;