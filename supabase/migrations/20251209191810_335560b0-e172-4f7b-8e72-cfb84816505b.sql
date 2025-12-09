-- Fix RLS policies for profiles and properties to be PERMISSIVE instead of RESTRICTIVE
-- This allows ANY matching policy to grant access (OR logic), not ALL policies (AND logic)

-- Drop existing restrictive UPDATE policies for profiles
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update org profiles" ON public.profiles;

-- Create PERMISSIVE UPDATE policy that combines all conditions with OR
CREATE POLICY "Users can update profiles" 
ON public.profiles 
FOR UPDATE 
USING (
  -- Users can update their own profile
  user_id = auth.uid()
  -- Superadmins can update any profile
  OR is_superadmin(auth.uid())
  -- Org admins can update profiles in their organization
  OR (is_admin(auth.uid()) AND organization_id = get_user_org_id(auth.uid()))
);

-- Drop existing restrictive SELECT policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Limited directory profile access" ON public.profiles;

-- Create PERMISSIVE SELECT policy that combines all conditions with OR
CREATE POLICY "Users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can view their own profile
  user_id = auth.uid()
  -- Superadmins can view any profile
  OR is_superadmin(auth.uid())
  -- Org admins can view profiles in their organization
  OR (is_admin(auth.uid()) AND organization_id = get_user_org_id(auth.uid()))
  -- Authenticated users can see directory profiles in their org
  OR (
    auth.uid() IS NOT NULL 
    AND organization_id = get_user_org_id(auth.uid())
    AND show_in_directory = true 
    AND is_active = true
  )
);

-- Drop existing restrictive INSERT policies for profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert org profiles" ON public.profiles;

-- Create PERMISSIVE INSERT policy
CREATE POLICY "Users can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  -- Users can insert their own profile
  user_id = auth.uid()
  -- Superadmins can insert any profile
  OR is_superadmin(auth.uid())
  -- Org admins can insert profiles in their organization
  OR (is_admin(auth.uid()) AND organization_id = get_user_org_id(auth.uid()))
);

-- Fix properties table policies
DROP POLICY IF EXISTS "Admins can manage org properties" ON public.properties;
DROP POLICY IF EXISTS "Agents can manage own properties" ON public.properties;

-- Create PERMISSIVE policy for properties management
CREATE POLICY "Staff can manage properties" 
ON public.properties 
FOR ALL 
USING (
  -- Superadmins can manage any property
  is_superadmin(auth.uid())
  -- Org admins can manage properties in their organization
  OR (is_admin(auth.uid()) AND organization_id = get_user_org_id(auth.uid()))
  -- Agents can manage their own properties
  OR agent_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
)
WITH CHECK (
  -- Superadmins can manage any property
  is_superadmin(auth.uid())
  -- Org admins can manage properties in their organization
  OR (is_admin(auth.uid()) AND organization_id = get_user_org_id(auth.uid()))
  -- Agents can manage their own properties
  OR agent_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);