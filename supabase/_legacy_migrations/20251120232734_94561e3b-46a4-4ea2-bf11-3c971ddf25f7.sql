-- ============================================
-- MULTI-TENANT FOUNDATION - PART 2
-- Main schema changes (superadmin enum now committed)
-- ============================================

-- 1. CREATE ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT,
  
  -- Contact & Branding
  contact_email TEXT NOT NULL,
  phone TEXT,
  logo_url TEXT,
  brand_colors JSONB DEFAULT '{"primary": "#667eea", "secondary": "#764ba2"}'::jsonb,
  
  -- Business
  commission_rate DECIMAL(5,2),
  billing_status TEXT DEFAULT 'active',
  subscription_plan TEXT DEFAULT 'internal',
  
  -- Settings & Features
  settings JSONB DEFAULT '{}'::jsonb,
  features JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_active ON organizations(is_active);

-- Seed YR Inmobiliaria as organization #1
INSERT INTO organizations (name, slug, contact_email, phone)
VALUES (
  'YR Inmobiliaria',
  'yr-inmobiliaria',
  'contacto@yrinmobiliaria.com',
  '(951) 123-4567'
)
ON CONFLICT (slug) DO NOTHING;

-- 2. CREATE AGENT LEVEL ENUM & PROFILES TABLE
DO $$ BEGIN
  CREATE TYPE agent_level AS ENUM ('junior', 'associate', 'senior', 'partner');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Basic Info
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  whatsapp_number TEXT,
  photo_url TEXT,
  
  -- Bio (multi-language support)
  bio_es TEXT,
  bio_en TEXT,
  
  -- Agent-Specific Fields (nullable for non-agents)
  agent_license_number TEXT,
  agent_specialty TEXT[],
  agent_years_experience INTEGER,
  agent_level agent_level,
  languages TEXT[] DEFAULT ARRAY['es'],
  
  -- Coverage Areas
  service_zones UUID[],
  
  -- Social Links
  linkedin_url TEXT,
  instagram_handle TEXT,
  facebook_url TEXT,
  
  -- Status & Visibility
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  show_in_directory BOOLEAN DEFAULT true,
  
  -- Profile Completion
  is_complete BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  
  -- Email Verification
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ,
  
  -- Constraints
  UNIQUE(organization_id, email)
);

CREATE INDEX IF NOT EXISTS idx_profiles_organization ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_featured ON profiles(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_profiles_directory ON profiles(show_in_directory, is_active) WHERE show_in_directory = true AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_profiles_incomplete ON profiles(is_complete) WHERE is_complete = false;

-- 3. UPDATE ROLE SYSTEM

-- Rename user_roles to role_assignments (if not already renamed)
DO $$ BEGIN
  ALTER TABLE user_roles RENAME TO role_assignments;
EXCEPTION
  WHEN undefined_table THEN null;
  WHEN duplicate_table THEN null;
END $$;

-- Add organization scoping columns (if not exist)
DO $$ BEGIN
  ALTER TABLE role_assignments ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE role_assignments ADD COLUMN granted_by UUID REFERENCES auth.users(id);
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE role_assignments ADD COLUMN granted_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE role_assignments ADD COLUMN expires_at TIMESTAMPTZ;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- Drop old unique constraint and add new one
ALTER TABLE role_assignments DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;
ALTER TABLE role_assignments DROP CONSTRAINT IF EXISTS unique_user_org_role;
ALTER TABLE role_assignments ADD CONSTRAINT unique_user_org_role UNIQUE(user_id, organization_id, role);

-- Update indexes
DROP INDEX IF EXISTS idx_user_roles_user_id;
CREATE INDEX IF NOT EXISTS idx_role_assignments_user ON role_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_role_assignments_org ON role_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_role_assignments_role ON role_assignments(role);

-- Update has_role function with org scoping (backwards compatible)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role, _org_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.role_assignments
    WHERE user_id = _user_id
      AND role = _role
      AND (
        _org_id IS NULL OR                        -- Backwards compatible: no org filter
        organization_id = _org_id OR              -- Scoped to specific org
        (role = 'superadmin' AND organization_id IS NULL) -- Superadmin is global
      )
  )
$$;

-- Helper function to check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.role_assignments
    WHERE user_id = _user_id
      AND role = 'superadmin'
      AND organization_id IS NULL
  )
$$;

-- 4. UPDATE EXISTING TABLES FOR MULTI-TENANCY

-- Add organization_id to properties
DO $$ BEGIN
  ALTER TABLE properties ADD COLUMN organization_id UUID REFERENCES organizations(id);
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE properties ADD COLUMN agent_id UUID REFERENCES profiles(id);
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE properties ADD COLUMN created_by UUID REFERENCES auth.users(id);
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE properties ADD COLUMN language TEXT DEFAULT 'es';
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE properties ADD COLUMN is_translation_of UUID REFERENCES properties(id);
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_properties_organization ON properties(organization_id);
CREATE INDEX IF NOT EXISTS idx_properties_agent ON properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_language ON properties(language);
CREATE INDEX IF NOT EXISTS idx_properties_translation ON properties(is_translation_of);

-- Migrate existing properties to YR organization
UPDATE properties
SET organization_id = (SELECT id FROM organizations WHERE slug = 'yr-inmobiliaria')
WHERE organization_id IS NULL;

-- Make organization_id required going forward
ALTER TABLE properties ALTER COLUMN organization_id SET NOT NULL;

-- Add organization_id to contact_inquiries
DO $$ BEGIN
  ALTER TABLE contact_inquiries ADD COLUMN organization_id UUID REFERENCES organizations(id);
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE contact_inquiries ADD COLUMN assigned_to_agent UUID REFERENCES profiles(id);
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE contact_inquiries ADD COLUMN assigned_by UUID REFERENCES auth.users(id);
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE contact_inquiries ADD COLUMN assigned_at TIMESTAMPTZ;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_inquiries_organization ON contact_inquiries(organization_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_agent ON contact_inquiries(assigned_to_agent);
CREATE INDEX IF NOT EXISTS idx_inquiries_property_fk ON contact_inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON contact_inquiries(status);

-- Migrate existing inquiries to YR organization
UPDATE contact_inquiries
SET organization_id = (SELECT id FROM organizations WHERE slug = 'yr-inmobiliaria')
WHERE organization_id IS NULL;

ALTER TABLE contact_inquiries ALTER COLUMN organization_id SET NOT NULL;

-- Add organization_id to scheduled_visits
DO $$ BEGIN
  ALTER TABLE scheduled_visits ADD COLUMN organization_id UUID REFERENCES organizations(id);
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE scheduled_visits ADD COLUMN agent_id UUID REFERENCES profiles(id);
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE scheduled_visits ADD COLUMN assigned_by UUID REFERENCES auth.users(id);
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE scheduled_visits ADD COLUMN assigned_at TIMESTAMPTZ;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_visits_organization ON scheduled_visits(organization_id);
CREATE INDEX IF NOT EXISTS idx_visits_agent ON scheduled_visits(agent_id);

-- Migrate existing visits to YR organization
UPDATE scheduled_visits
SET organization_id = (SELECT id FROM organizations WHERE slug = 'yr-inmobiliaria')
WHERE organization_id IS NULL;

ALTER TABLE scheduled_visits ALTER COLUMN organization_id SET NOT NULL;

-- 5. CREATE AGENT INVITATION SYSTEM
CREATE TABLE IF NOT EXISTS agent_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Pre-filled information
  display_name TEXT,
  phone TEXT,
  service_zones UUID[],
  
  -- Invitation status
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users(id),
  
  UNIQUE(organization_id, email)
);

CREATE INDEX IF NOT EXISTS idx_invitations_token ON agent_invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON agent_invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_org ON agent_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_pending ON agent_invitations(accepted_at) WHERE accepted_at IS NULL;

-- 6. IMPLEMENT ROW-LEVEL SECURITY POLICIES

-- Enable RLS on new tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_invitations ENABLE ROW LEVEL SECURITY;

-- Organizations: Public read active orgs, superadmin write
DROP POLICY IF EXISTS "Anyone can view active organizations" ON organizations;
CREATE POLICY "Anyone can view active organizations"
  ON organizations FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Superadmins can manage organizations" ON organizations;
CREATE POLICY "Superadmins can manage organizations"
  ON organizations FOR ALL
  TO authenticated
  USING (public.is_superadmin(auth.uid()));

-- Profiles: Public read for directory, users manage own, admins manage org profiles
DROP POLICY IF EXISTS "Public can view directory profiles" ON profiles;
CREATE POLICY "Public can view directory profiles"
  ON profiles FOR SELECT
  USING (show_in_directory = true AND is_active = true);

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage org profiles" ON profiles;
CREATE POLICY "Admins can manage org profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM role_assignments
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "Superadmins can manage all profiles" ON profiles;
CREATE POLICY "Superadmins can manage all profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (public.is_superadmin(auth.uid()));

-- Properties: Update for multi-tenancy
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON properties;
DROP POLICY IF EXISTS "Public can view active properties" ON properties;
CREATE POLICY "Public can view active properties"
  ON properties FOR SELECT
  USING (status = 'disponible');

DROP POLICY IF EXISTS "Agents can manage own properties" ON properties;
CREATE POLICY "Agents can manage own properties"
  ON properties FOR ALL
  TO authenticated
  USING (
    agent_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can insert properties" ON properties;
DROP POLICY IF EXISTS "Admins can update properties" ON properties;
DROP POLICY IF EXISTS "Admins can delete properties" ON properties;
DROP POLICY IF EXISTS "Admins can manage org properties" ON properties;
CREATE POLICY "Admins can manage org properties"
  ON properties FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM role_assignments
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    ) OR
    public.is_superadmin(auth.uid())
  );

-- Contact Inquiries: Update for multi-tenancy
DROP POLICY IF EXISTS "Agents can view assigned inquiries" ON contact_inquiries;
CREATE POLICY "Agents can view assigned inquiries"
  ON contact_inquiries FOR SELECT
  TO authenticated
  USING (
    assigned_to_agent IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can view all contact inquiries" ON contact_inquiries;
DROP POLICY IF EXISTS "Admins can update contact inquiries" ON contact_inquiries;
DROP POLICY IF EXISTS "Admins can delete contact inquiries" ON contact_inquiries;
DROP POLICY IF EXISTS "Admins can manage org inquiries" ON contact_inquiries;
CREATE POLICY "Admins can manage org inquiries"
  ON contact_inquiries FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM role_assignments
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    ) OR
    public.is_superadmin(auth.uid())
  );

-- Scheduled Visits: Update for multi-tenancy
DROP POLICY IF EXISTS "Agents can view assigned visits" ON scheduled_visits;
CREATE POLICY "Agents can view assigned visits"
  ON scheduled_visits FOR SELECT
  TO authenticated
  USING (
    agent_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can view all scheduled visits" ON scheduled_visits;
DROP POLICY IF EXISTS "Admins can update scheduled visits" ON scheduled_visits;
DROP POLICY IF EXISTS "Admins can delete scheduled visits" ON scheduled_visits;
DROP POLICY IF EXISTS "Admins can manage org visits" ON scheduled_visits;
CREATE POLICY "Admins can manage org visits"
  ON scheduled_visits FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM role_assignments
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    ) OR
    public.is_superadmin(auth.uid())
  );

-- User Favorites: Ensure correct policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can add their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can remove their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON user_favorites;
CREATE POLICY "Users can manage own favorites"
  ON user_favorites FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Agent Invitations: Admins can manage org invitations
DROP POLICY IF EXISTS "Admins can manage org invitations" ON agent_invitations;
CREATE POLICY "Admins can manage org invitations"
  ON agent_invitations FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM role_assignments
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    ) OR
    public.is_superadmin(auth.uid())
  );

-- 7. SEED INITIAL DATA (Carlo and Yas profiles)
DO $$
DECLARE
  yr_org_id UUID;
  carlo_user_id UUID;
  yas_user_id UUID;
BEGIN
  -- Get YR organization ID
  SELECT id INTO yr_org_id FROM organizations WHERE slug = 'yr-inmobiliaria';
  
  -- Get user IDs
  SELECT id INTO carlo_user_id FROM auth.users WHERE email = 'carlo.spada22@gmail.com';
  SELECT id INTO yas_user_id FROM auth.users WHERE email = 'ruizvasquezyazmin@gmail.com';
  
  -- Only proceed if users exist
  IF carlo_user_id IS NOT NULL THEN
    -- Create Carlo's profile (SuperAdmin, no org)
    INSERT INTO profiles (user_id, display_name, email, is_complete, completed_at, email_verified, email_verified_at)
    VALUES (
      carlo_user_id,
      'Carlo Spada',
      'carlo.spada22@gmail.com',
      true,
      NOW(),
      true,
      NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Assign Carlo as SuperAdmin (global, no org)
    INSERT INTO role_assignments (user_id, organization_id, role, granted_at)
    VALUES (carlo_user_id, NULL, 'superadmin', NOW())
    ON CONFLICT (user_id, organization_id, role) DO NOTHING;
  END IF;
  
  IF yas_user_id IS NOT NULL AND yr_org_id IS NOT NULL THEN
    -- Create Yas's profile (Admin of YR)
    INSERT INTO profiles (
      user_id,
      organization_id,
      display_name,
      email,
      phone,
      languages,
      service_zones,
      is_active,
      is_featured,
      show_in_directory,
      is_complete,
      completed_at,
      email_verified,
      email_verified_at
    )
    VALUES (
      yas_user_id,
      yr_org_id,
      'Yasmin Ruiz',
      'ruizvasquezyazmin@gmail.com',
      '(951) 123-4567',
      ARRAY['es'],
      (SELECT array_agg(id) FROM service_zones WHERE active = true LIMIT 3),
      true,
      true,
      true,
      true,
      NOW(),
      true,
      NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Assign Yas as Admin of YR
    INSERT INTO role_assignments (user_id, organization_id, role, granted_by, granted_at)
    VALUES (yas_user_id, yr_org_id, 'admin', carlo_user_id, NOW())
    ON CONFLICT (user_id, organization_id, role) DO NOTHING;
  END IF;
END $$;