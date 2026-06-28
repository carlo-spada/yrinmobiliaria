-- ============================================
-- HIERARCHICAL SINGLE-ROLE SYSTEM MIGRATION
-- ============================================

-- 1. Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role public.app_role DEFAULT 'user'::app_role NOT NULL;

-- 2. Migrate existing role_assignments data to profiles
-- Priority: superadmin > admin > agent > user
UPDATE public.profiles p
SET role = COALESCE(
  (
    SELECT 
      CASE 
        WHEN bool_or(ra.role = 'superadmin') THEN 'superadmin'::app_role
        WHEN bool_or(ra.role = 'admin') THEN 'admin'::app_role
        ELSE 'user'::app_role
      END
    FROM public.role_assignments ra
    WHERE ra.user_id = p.user_id
  ),
  CASE 
    WHEN p.agent_level IS NOT NULL THEN 'user'::app_role
    ELSE 'user'::app_role
  END
);

-- 3. Create new hierarchical has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE _role
      -- Superadmin check
      WHEN 'superadmin' THEN 
        EXISTS (SELECT 1 FROM public.profiles WHERE user_id = _user_id AND role = 'superadmin')
      
      -- Admin check (superadmin inherits admin)
      WHEN 'admin' THEN 
        EXISTS (SELECT 1 FROM public.profiles WHERE user_id = _user_id AND role IN ('superadmin', 'admin'))
      
      -- User check (everyone inherits user)
      WHEN 'user' THEN 
        EXISTS (SELECT 1 FROM public.profiles WHERE user_id = _user_id)
      
      ELSE false
    END
$$;

-- 4. Create is_superadmin function using new system
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = _user_id AND role = 'superadmin'
  )
$$;

-- 5. Update RLS policies to use hierarchical permissions

-- PROFILES TABLE
DROP POLICY IF EXISTS "Admins can view org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert org profiles" ON public.profiles;

CREATE POLICY "Admins can view org profiles"
ON public.profiles FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('superadmin', 'admin')
  ) OR is_superadmin(auth.uid())
);

CREATE POLICY "Admins can update org profiles"
ON public.profiles FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('superadmin', 'admin')
  ) OR is_superadmin(auth.uid())
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('superadmin', 'admin')
  ) OR is_superadmin(auth.uid())
);

CREATE POLICY "Admins can insert org profiles"
ON public.profiles FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('superadmin', 'admin')
  ) OR is_superadmin(auth.uid())
);

-- PROPERTIES TABLE
DROP POLICY IF EXISTS "Admins can view org properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can update org properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can insert org properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can delete org properties" ON public.properties;

CREATE POLICY "Admins can view org properties"
ON public.properties FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('superadmin', 'admin')
  ) OR is_superadmin(auth.uid()) OR agent_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can update org properties"
ON public.properties FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('superadmin', 'admin')
  ) OR is_superadmin(auth.uid()) OR agent_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('superadmin', 'admin')
  ) OR is_superadmin(auth.uid()) OR agent_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can insert org properties"
ON public.properties FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('superadmin', 'admin')
  ) OR is_superadmin(auth.uid())
);

CREATE POLICY "Admins can delete org properties"
ON public.properties FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('superadmin', 'admin')
  ) OR is_superadmin(auth.uid())
);

-- CONTACT INQUIRIES
DROP POLICY IF EXISTS "Admins can manage org inquiries" ON public.contact_inquiries;

CREATE POLICY "Admins can manage org inquiries"
ON public.contact_inquiries FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('superadmin', 'admin')
  ) OR is_superadmin(auth.uid())
);

-- SCHEDULED VISITS
DROP POLICY IF EXISTS "Admins can manage org visits" ON public.scheduled_visits;

CREATE POLICY "Admins can manage org visits"
ON public.scheduled_visits FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('superadmin', 'admin')
  ) OR is_superadmin(auth.uid())
);

-- AGENT INVITATIONS
DROP POLICY IF EXISTS "Admins can manage org invitations" ON public.agent_invitations;

CREATE POLICY "Admins can manage org invitations"
ON public.agent_invitations FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('superadmin', 'admin')
  ) OR is_superadmin(auth.uid())
);

-- SERVICE ZONES
DROP POLICY IF EXISTS "Admins can insert service zones" ON public.service_zones;
DROP POLICY IF EXISTS "Admins can update service zones" ON public.service_zones;
DROP POLICY IF EXISTS "Admins can delete service zones" ON public.service_zones;

CREATE POLICY "Admins can insert service zones"
ON public.service_zones FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('superadmin', 'admin')
  ) OR is_superadmin(auth.uid())
);

CREATE POLICY "Admins can update service zones"
ON public.service_zones FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('superadmin', 'admin')
  ) OR is_superadmin(auth.uid())
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('superadmin', 'admin')
  ) OR is_superadmin(auth.uid())
);

CREATE POLICY "Admins can delete service zones"
ON public.service_zones FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('superadmin', 'admin')
  ) OR is_superadmin(auth.uid())
);

-- SITE SETTINGS
DROP POLICY IF EXISTS "Admins can insert site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can delete site settings" ON public.site_settings;

CREATE POLICY "Admins can insert site settings"
ON public.site_settings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('superadmin', 'admin')
  ) OR is_superadmin(auth.uid())
);

CREATE POLICY "Admins can update site settings"
ON public.site_settings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('superadmin', 'admin')
  ) OR is_superadmin(auth.uid())
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('superadmin', 'admin')
  ) OR is_superadmin(auth.uid())
);

CREATE POLICY "Admins can delete site settings"
ON public.site_settings FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('superadmin', 'admin')
  ) OR is_superadmin(auth.uid())
);

-- AUDIT LOGS
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('superadmin', 'admin')
  )
);

-- CMS PAGES
DROP POLICY IF EXISTS "Admins and superadmins can manage cms_pages" ON public.cms_pages;

CREATE POLICY "Admins and superadmins can manage cms_pages"
ON public.cms_pages FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.organization_id = cms_pages.organization_id 
    AND p.role IN ('superadmin', 'admin')
  )
);

-- 6. Update handle_new_user function to use new system
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  default_display_name TEXT;
  yr_org_id UUID;
BEGIN
  default_display_name := SPLIT_PART(NEW.email, '@', 1);
  
  SELECT id INTO yr_org_id FROM organizations WHERE slug = 'yr-inmobiliaria';

  -- Create profile with appropriate role
  INSERT INTO public.profiles (user_id, email, display_name, is_complete, email_verified, created_at, updated_at, role, organization_id)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', default_display_name),
    false, 
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false), 
    NOW(), 
    NOW(),
    CASE 
      WHEN NEW.email = 'carlo.spada22@gmail.com' THEN 'superadmin'::app_role
      WHEN NEW.email = 'ruizvasquezyazmin@gmail.com' THEN 'admin'::app_role
      ELSE 'user'::app_role
    END,
    CASE 
      WHEN NEW.email = 'ruizvasquezyazmin@gmail.com' THEN yr_org_id
      ELSE NULL
    END
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$function$;