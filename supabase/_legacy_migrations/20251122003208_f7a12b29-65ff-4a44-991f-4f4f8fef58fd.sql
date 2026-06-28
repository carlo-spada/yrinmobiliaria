-- 1) Ensure mother org exists
INSERT INTO organizations (id, name, slug, contact_email, domain, is_active)
VALUES (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'YR Inmobiliaria',
  'yrinmobiliaria',
  'ruizvasquezyazmin@gmail.com',
  'yrinmobiliaria.com',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 2) Ensure storage bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', false)
ON CONFLICT (id) DO NOTHING;

-- 3) Drop existing storage policies
DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and agents can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and agents can delete property images" ON storage.objects;

-- Create storage policies (role_assignments + agent profiles)
CREATE POLICY "Public can view property images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'property-images');

CREATE POLICY "Admins and agents can upload property images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'property-images'
  AND (
    EXISTS (SELECT 1 FROM public.role_assignments ra WHERE ra.user_id = auth.uid() AND ra.role IN ('admin','superadmin'))
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.agent_level IS NOT NULL AND p.organization_id IS NOT NULL)
  )
);

CREATE POLICY "Admins can update property images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'property-images'
  AND (
    EXISTS (SELECT 1 FROM public.role_assignments ra WHERE ra.user_id = auth.uid() AND ra.role IN ('admin','superadmin'))
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.agent_level IS NOT NULL AND p.organization_id IS NOT NULL)
  )
);

CREATE POLICY "Admins and agents can delete property images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'property-images'
  AND (
    EXISTS (SELECT 1 FROM public.role_assignments ra WHERE ra.user_id = auth.uid() AND ra.role IN ('admin','superadmin'))
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.agent_level IS NOT NULL AND p.organization_id IS NOT NULL)
  )
);

-- 4) Backfill org membership for core users in profiles
WITH mo AS (SELECT id FROM organizations WHERE slug = 'yrinmobiliaria' LIMIT 1)
UPDATE profiles
SET organization_id = (SELECT id FROM mo)
WHERE organization_id IS NULL
  AND user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('carlo.spada22@gmail.com', 'ruizvasquezyazmin@gmail.com')
  );

-- Backfill role_assignments for core users (only admin role exists in enum)
WITH mo AS (SELECT id FROM organizations WHERE slug = 'yrinmobiliaria' LIMIT 1)
UPDATE role_assignments
SET organization_id = (SELECT id FROM mo)
WHERE organization_id IS NULL
  AND role = 'admin'
  AND user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('carlo.spada22@gmail.com', 'ruizvasquezyazmin@gmail.com')
  );

-- 5) Enforce that admins must have an org (superadmin exempt, agents not in role_assignments)
ALTER TABLE role_assignments
  DROP CONSTRAINT IF EXISTS role_assignments_org_required_for_staff;

ALTER TABLE role_assignments
  ADD CONSTRAINT role_assignments_org_required_for_staff
  CHECK (
    role != 'admin'
    OR organization_id IS NOT NULL
  );