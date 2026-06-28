-- Drop all existing functions explicitly by signature
-- Then recreate the role system without recursion

-- 1. Disable RLS temporarily 
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Drop functions by explicit signature
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_my_role() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_org(uuid) CASCADE;

-- 3. Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Ensure app_role enum exists
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'superadmin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. Create role_assignments table if not exists
CREATE TABLE IF NOT EXISTS public.role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    organization_id UUID REFERENCES public.organizations(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role, organization_id)
);

-- 6. Migrate roles from users to role_assignments
INSERT INTO public.role_assignments (user_id, role, organization_id)
SELECT 
    id,
    CASE 
        WHEN role = 'superadmin' THEN 'superadmin'::app_role
        WHEN role = 'admin' THEN 'admin'::app_role
        WHEN role = 'agent' THEN 'user'::app_role
        ELSE 'user'::app_role
    END,
    organization_id
FROM public.users
ON CONFLICT (user_id, role, organization_id) DO NOTHING;

-- 7. Enable RLS on role_assignments
ALTER TABLE public.role_assignments ENABLE ROW LEVEL SECURITY;

-- 8. Create single has_role function (queries role_assignments, NOT users)
CREATE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.role_assignments
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 9. Simple policies on users table (NO RECURSION)
CREATE POLICY "view_own_user" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "superadmin_view_all" ON public.users
    FOR SELECT USING (public.has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "superadmin_update_all" ON public.users
    FOR UPDATE USING (public.has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "update_own_user" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- 10. Policies on role_assignments
CREATE POLICY "view_own_roles" ON public.role_assignments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "superadmin_view_all_roles" ON public.role_assignments
    FOR SELECT USING (public.has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "superadmin_manage_roles" ON public.role_assignments
    FOR ALL USING (public.has_role(auth.uid(), 'superadmin'::app_role));