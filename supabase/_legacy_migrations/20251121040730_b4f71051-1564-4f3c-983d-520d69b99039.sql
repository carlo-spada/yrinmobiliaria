-- ============================================================================
-- FIX CRITICAL DATABASE & STORAGE ISSUES
-- ============================================================================

-- ============================================================================
-- ISSUE 1: Fix audit_logs RLS Policy
-- ============================================================================
-- Drop old policy that uses broken has_role function
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

-- Create new policy with direct role_assignments check
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.role_assignments ra
    WHERE ra.user_id = auth.uid()
    AND ra.role IN ('admin', 'superadmin')
  )
);

-- ============================================================================
-- ISSUE 2: Create property-images Storage Bucket
-- ============================================================================
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  10485760, -- 10MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and agents can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update property images" ON storage.objects;

-- Create storage policies for property-images bucket
-- Public read access (property images are public listings)
CREATE POLICY "Public can view property images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'property-images');

-- Authenticated admins can upload
CREATE POLICY "Admins and agents can upload property images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'property-images'
  AND EXISTS (
    SELECT 1 FROM public.role_assignments ra
    WHERE ra.user_id = auth.uid()
    AND ra.role IN ('admin', 'superadmin')
  )
);

-- Admins can update metadata
CREATE POLICY "Admins can update property images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'property-images'
  AND EXISTS (
    SELECT 1 FROM public.role_assignments ra
    WHERE ra.user_id = auth.uid()
    AND ra.role IN ('admin', 'superadmin')
  )
);

-- Only admins can delete
CREATE POLICY "Admins can delete property images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'property-images'
  AND EXISTS (
    SELECT 1 FROM public.role_assignments ra
    WHERE ra.user_id = auth.uid()
    AND ra.role IN ('admin', 'superadmin')
  )
);

-- ============================================================================
-- ISSUE 3: Ensure Yas has Profile and Admin Role
-- ============================================================================
DO $$
DECLARE
  yas_user_id UUID;
  yr_org_id UUID;
BEGIN
  -- Find Yas's user_id from auth.users
  SELECT id INTO yas_user_id
  FROM auth.users
  WHERE email = 'ruizvasquezyazmin@gmail.com';

  -- Find YR Inmobiliaria organization
  SELECT id INTO yr_org_id
  FROM organizations
  WHERE slug = 'yr-inmobiliaria';

  -- Only proceed if user exists
  IF yas_user_id IS NOT NULL THEN
    -- Create profile if missing
    INSERT INTO public.profiles (user_id, email, display_name, organization_id, is_complete, email_verified, created_at, updated_at)
    VALUES (
      yas_user_id,
      'ruizvasquezyazmin@gmail.com',
      'Yazmin Ruiz Vasquez',
      yr_org_id,
      false,
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      email = EXCLUDED.email,
      organization_id = COALESCE(EXCLUDED.organization_id, profiles.organization_id),
      updated_at = NOW();

    -- Ensure default 'user' role exists
    INSERT INTO public.role_assignments (user_id, role, granted_at)
    VALUES (yas_user_id, 'user', NOW())
    ON CONFLICT DO NOTHING;

    -- Ensure admin role exists for YR Inmobiliaria
    IF yr_org_id IS NOT NULL THEN
      INSERT INTO public.role_assignments (user_id, organization_id, role, granted_at)
      VALUES (yas_user_id, yr_org_id, 'admin', NOW())
      ON CONFLICT DO NOTHING;
    END IF;

    RAISE NOTICE 'Profile and roles ensured for Yas (%)' , yas_user_id;
  ELSE
    RAISE NOTICE 'User ruizvasquezyazmin@gmail.com not found in auth.users';
  END IF;
END $$;