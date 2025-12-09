-- Fix organizations RLS to make the public view policy PERMISSIVE
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active organizations" ON public.organizations;
DROP POLICY IF EXISTS "Superadmins can manage organizations" ON public.organizations;

-- Create PERMISSIVE policy for viewing active organizations (default is PERMISSIVE)
CREATE POLICY "Anyone can view active organizations" ON public.organizations
FOR SELECT USING (is_active = true);

-- Create PERMISSIVE policy for superadmins to manage all organizations
CREATE POLICY "Superadmins can manage organizations" ON public.organizations
FOR ALL USING (public.is_superadmin(auth.uid()));