-- Flatten Database Architecture with Strict Separation
-- 1. public.users (System/Security)
-- 2. public.profiles (User Content)

-- 1. Create new Role Enum (if not exists)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'agent', 'client', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create public.users table (The "System" table)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role user_role DEFAULT 'user' NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(email)
);

-- 3. Migrate data from role_assignments/profiles to public.users
-- We take the highest role from assignments, or default to 'user'
-- We take organization from assignments or profiles

INSERT INTO public.users (id, email, role, organization_id, created_at)
SELECT 
    au.id,
    au.email,
    COALESCE(
        (SELECT role::user_role FROM role_assignments ra WHERE ra.user_id = au.id ORDER BY 
            CASE role 
                WHEN 'superadmin' THEN 1 
                WHEN 'admin' THEN 2 
                WHEN 'agent' THEN 3 
                ELSE 4 
            END ASC LIMIT 1),
        'user'::user_role
    ) as role,
    COALESCE(
        (SELECT organization_id FROM role_assignments ra WHERE ra.user_id = au.id AND organization_id IS NOT NULL LIMIT 1),
        (SELECT organization_id FROM profiles p WHERE p.user_id = au.id LIMIT 1)
    ) as organization_id,
    au.created_at
FROM auth.users au
ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    organization_id = EXCLUDED.organization_id;

-- 4. Clean up public.profiles (Remove system fields)
-- Note: We keep display_name, bio, etc.
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role; -- In case it was added by previous attempt
-- We might want to keep organization_id in profiles as a "display" preference? 
-- No, user said "one and only one organization", so it belongs in users.
ALTER TABLE public.profiles DROP COLUMN IF EXISTS organization_id;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email; -- It's in users now
ALTER TABLE public.profiles DROP COLUMN IF EXISTS agent_level; -- Simplified to role 'agent'

-- Ensure profiles link to users
-- (They already link to auth.users, which is the same ID as public.users)

-- 5. Drop old complex tables
DROP TABLE IF EXISTS public.role_assignments CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- 6. RLS Policies

-- public.users: 
-- - Users can read their own
-- - Admins can read/write their org's users
-- - Superadmin can read/write all

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own system data" ON public.users;
CREATE POLICY "Users can view own system data" ON public.users FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage org users" ON public.users;
CREATE POLICY "Admins can manage org users" ON public.users FOR ALL USING (
    organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
    OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'superadmin')
);

-- public.profiles:
-- - Users can read/write their own
-- - Public can read (for directory)
-- - Admins can read (to display in lists)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own profile" ON public.profiles;
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true); -- Simplified for directory

-- 7. Update Properties RLS
-- Depend on public.users for role check

DROP POLICY IF EXISTS "Admins can manage org properties" ON public.properties;
CREATE POLICY "Admins can manage org properties" ON public.properties FOR ALL USING (
    organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
);

DROP POLICY IF EXISTS "Agents manage own properties" ON public.properties;
CREATE POLICY "Agents manage own properties" ON public.properties FOR ALL USING (
    agent_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- 8. Dynamic Schema Tables (Same as before)
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
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'superadmin')
);

CREATE POLICY "Public read field defs" ON public.field_definitions FOR SELECT USING (true);
CREATE POLICY "Superadmin write field defs" ON public.field_definitions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'superadmin')
);

INSERT INTO public.entity_definitions (slug, name) VALUES 
('properties', 'Propiedades'),
('users', 'Usuarios')
ON CONFLICT (slug) DO NOTHING;
