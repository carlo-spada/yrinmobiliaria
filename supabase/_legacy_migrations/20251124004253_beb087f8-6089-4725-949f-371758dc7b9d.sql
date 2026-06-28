-- Fix infinite recursion in users table RLS policies
-- The issue: policies were querying the users table within the policy condition,
-- creating circular dependencies

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Superadmins can view all" ON public.users;
DROP POLICY IF EXISTS "Admins can view organization users" ON public.users;
DROP POLICY IF EXISTS "Superadmins can manage all" ON public.users;
DROP POLICY IF EXISTS "Admins can manage org users" ON public.users;

-- Create a security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- Create non-recursive policies using the function
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Superadmins can view all" ON public.users
    FOR SELECT 
    USING (get_my_role() = 'superadmin');

CREATE POLICY "Admins can view organization users" ON public.users
    FOR SELECT 
    USING (
        get_my_role() IN ('admin', 'superadmin') 
        AND organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    );

CREATE POLICY "Superadmins can update all" ON public.users
    FOR UPDATE 
    USING (get_my_role() = 'superadmin');

CREATE POLICY "Admins can update org users" ON public.users
    FOR UPDATE 
    USING (
        get_my_role() IN ('admin', 'superadmin') 
        AND organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
        AND id != auth.uid() -- Can't change own role
    );

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        AND role = (SELECT role FROM public.users WHERE id = auth.uid()) -- Can't change own role
    );