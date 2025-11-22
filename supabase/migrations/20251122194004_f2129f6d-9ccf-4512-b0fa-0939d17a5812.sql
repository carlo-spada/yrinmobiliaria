-- Fix RLS policies to use role_assignments table instead of deprecated user_roles
-- This migration enables admin/superadmin users to perform all CRUD operations

-- ============================================
-- 1. PROFILES TABLE - Fix admin/superadmin access
-- ============================================

-- Drop old policies that reference non-existent user_roles table
DROP POLICY IF EXISTS "Admins can manage org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Superadmins can manage all profiles" ON public.profiles;

-- Create new comprehensive policies
CREATE POLICY "Admins can view org profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM role_assignments 
    WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
  )
  OR is_superadmin(auth.uid())
);

CREATE POLICY "Admins can update org profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM role_assignments 
    WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
  )
  OR is_superadmin(auth.uid())
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM role_assignments 
    WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
  )
  OR is_superadmin(auth.uid())
);

CREATE POLICY "Admins can insert org profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM role_assignments 
    WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
  )
  OR is_superadmin(auth.uid())
);

-- ============================================
-- 2. PROPERTIES TABLE - Fix admin/superadmin/agent access
-- ============================================

-- Drop old policies
DROP POLICY IF EXISTS "Admins can manage org properties" ON public.properties;

-- Create comprehensive policies
CREATE POLICY "Admins can view org properties"
ON public.properties
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM role_assignments 
    WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
  )
  OR is_superadmin(auth.uid())
  OR agent_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can insert org properties"
ON public.properties
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM role_assignments 
    WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
  )
  OR is_superadmin(auth.uid())
);

CREATE POLICY "Admins can update org properties"
ON public.properties
FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM role_assignments 
    WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
  )
  OR is_superadmin(auth.uid())
  OR agent_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM role_assignments 
    WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
  )
  OR is_superadmin(auth.uid())
  OR agent_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can delete org properties"
ON public.properties
FOR DELETE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM role_assignments 
    WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
  )
  OR is_superadmin(auth.uid())
);

-- ============================================
-- 3. PROPERTY_IMAGES TABLE - Fix admin/agent access
-- ============================================

-- Drop old policies
DROP POLICY IF EXISTS "Admins can insert images" ON public.property_images;
DROP POLICY IF EXISTS "Admins can update images" ON public.property_images;
DROP POLICY IF EXISTS "Admins can delete images" ON public.property_images;

-- Create new policies with agent support
CREATE POLICY "Admins and agents can insert images"
ON public.property_images
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM properties p
    WHERE p.id = property_id
      AND (
        p.organization_id IN (
          SELECT organization_id 
          FROM role_assignments 
          WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
        OR is_superadmin(auth.uid())
        OR p.agent_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
      )
  )
);

CREATE POLICY "Admins and agents can update images"
ON public.property_images
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM properties p
    WHERE p.id = property_id
      AND (
        p.organization_id IN (
          SELECT organization_id 
          FROM role_assignments 
          WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
        OR is_superadmin(auth.uid())
        OR p.agent_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM properties p
    WHERE p.id = property_id
      AND (
        p.organization_id IN (
          SELECT organization_id 
          FROM role_assignments 
          WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
        OR is_superadmin(auth.uid())
        OR p.agent_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
      )
  )
);

CREATE POLICY "Admins and agents can delete images"
ON public.property_images
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM properties p
    WHERE p.id = property_id
      AND (
        p.organization_id IN (
          SELECT organization_id 
          FROM role_assignments 
          WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
        OR is_superadmin(auth.uid())
        OR p.agent_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
      )
  )
);

-- ============================================
-- 4. SERVICE_ZONES TABLE - Fix admin access
-- ============================================

-- Drop old policies
DROP POLICY IF EXISTS "Admins can insert service zones" ON public.service_zones;
DROP POLICY IF EXISTS "Admins can update service zones" ON public.service_zones;
DROP POLICY IF EXISTS "Admins can delete service zones" ON public.service_zones;

-- Create new policies using role_assignments
CREATE POLICY "Admins can insert service zones"
ON public.service_zones
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM role_assignments 
    WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
  )
  OR is_superadmin(auth.uid())
);

CREATE POLICY "Admins can update service zones"
ON public.service_zones
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM role_assignments 
    WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
  )
  OR is_superadmin(auth.uid())
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM role_assignments 
    WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
  )
  OR is_superadmin(auth.uid())
);

CREATE POLICY "Admins can delete service zones"
ON public.service_zones
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM role_assignments 
    WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
  )
  OR is_superadmin(auth.uid())
);

-- ============================================
-- 5. SITE_SETTINGS TABLE - Fix admin access
-- ============================================

-- Drop old policies
DROP POLICY IF EXISTS "Admins can insert site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can delete site settings" ON public.site_settings;

-- Create new policies using role_assignments
CREATE POLICY "Admins can insert site settings"
ON public.site_settings
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM role_assignments 
    WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
  )
  OR is_superadmin(auth.uid())
);

CREATE POLICY "Admins can update site settings"
ON public.site_settings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM role_assignments 
    WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
  )
  OR is_superadmin(auth.uid())
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM role_assignments 
    WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
  )
  OR is_superadmin(auth.uid())
);

CREATE POLICY "Admins can delete site settings"
ON public.site_settings
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM role_assignments 
    WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
  )
  OR is_superadmin(auth.uid())
);

-- ============================================
-- 6. STORAGE BUCKET POLICIES - property-images
-- ============================================

-- Drop ALL existing property-images policies
DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and agents can delete property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and agents can update property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and agents can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update property images" ON storage.objects;
DROP POLICY IF EXISTS "Property images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to property-images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and agents can delete from property-images" ON storage.objects;

-- Public read access
CREATE POLICY "Public can view property images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'property-images');

-- Authenticated upload access (simplified - allow all authenticated users)
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-images'
  AND auth.uid() IS NOT NULL
);

-- Admin/agent delete access
CREATE POLICY "Admins and agents can delete property images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images'
  AND (
    EXISTS (
      SELECT 1 FROM role_assignments 
      WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
    )
    OR is_superadmin(auth.uid())
    OR auth.uid() = owner
  )
);

-- Update access for metadata changes
CREATE POLICY "Admins can update property images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-images'
  AND (
    EXISTS (
      SELECT 1 FROM role_assignments 
      WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
    )
    OR is_superadmin(auth.uid())
  )
)
WITH CHECK (
  bucket_id = 'property-images'
  AND (
    EXISTS (
      SELECT 1 FROM role_assignments 
      WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
    )
    OR is_superadmin(auth.uid())
  )
);