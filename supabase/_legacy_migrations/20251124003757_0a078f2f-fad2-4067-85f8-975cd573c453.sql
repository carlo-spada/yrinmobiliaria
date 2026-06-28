-- 1. Create users table (system/security)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    organization_id UUID REFERENCES public.organizations(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Migrate existing data from profiles
INSERT INTO public.users (id, email, role, organization_id)
SELECT 
    p.user_id,
    p.email,
    p.role,
    p.organization_id
FROM public.profiles p
ON CONFLICT (id) DO NOTHING;

-- 3. Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can view own data
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Superadmins can view all
CREATE POLICY "Superadmins can view all" ON public.users
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'superadmin')
    );

-- Admins can view/manage org users
CREATE POLICY "Admins can manage org users" ON public.users
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

-- Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at();