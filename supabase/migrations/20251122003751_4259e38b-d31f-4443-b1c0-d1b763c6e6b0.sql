-- 1) Get mother org (already exists from previous migration)
-- 2) Create personal orgs for staff missing org
WITH staff AS (
  SELECT u.id AS user_id, u.email
  FROM auth.users u
  WHERE u.id IN (
    SELECT user_id FROM role_assignments WHERE role IN ('admin', 'superadmin')
    UNION
    SELECT user_id FROM profiles WHERE agent_level IS NOT NULL
  )
),
missing_org_staff AS (
  SELECT s.user_id, s.email
  FROM staff s
  WHERE s.user_id IN (SELECT user_id FROM profiles WHERE organization_id IS NULL)
)
INSERT INTO organizations (id, name, slug, contact_email, domain, is_active)
SELECT 
  gen_random_uuid(),
  CONCAT('Personal Org - ', COALESCE(email, user_id::text)),
  CONCAT('personal-', REPLACE(COALESCE(email, user_id::text), '@', '-at-'), '-', SUBSTRING(user_id::text, 1, 8)),
  email,
  NULL,
  true
FROM missing_org_staff
ON CONFLICT (slug) DO NOTHING;

-- 3) Backfill profiles to mother org for core emails, else personal org
WITH mother AS (
  SELECT id FROM organizations WHERE slug = 'yrinmobiliaria' LIMIT 1
),
personal AS (
  SELECT org.id, u.id AS user_id
  FROM organizations org
  JOIN auth.users u ON org.slug LIKE CONCAT('personal-', REPLACE(u.email, '@', '-at-'), '%')
)
UPDATE profiles p
SET organization_id = CASE
  WHEN p.user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('carlo.spada22@gmail.com', 'ruizvasquezyazmin@gmail.com')
  ) THEN (SELECT id FROM mother)
  ELSE (SELECT id FROM personal WHERE personal.user_id = p.user_id)
END
WHERE p.organization_id IS NULL
  AND (
    p.user_id IN (SELECT id FROM auth.users WHERE email IN ('carlo.spada22@gmail.com', 'ruizvasquezyazmin@gmail.com'))
    OR p.user_id IN (SELECT user_id FROM personal)
  );

-- 4) Backfill role_assignments for admins/superadmins
WITH mother AS (
  SELECT id FROM organizations WHERE slug = 'yrinmobiliaria' LIMIT 1
),
personal AS (
  SELECT org.id, u.id AS user_id
  FROM organizations org
  JOIN auth.users u ON org.slug LIKE CONCAT('personal-', REPLACE(u.email, '@', '-at-'), '%')
)
UPDATE role_assignments ra
SET organization_id = CASE
  WHEN ra.user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('carlo.spada22@gmail.com', 'ruizvasquezyazmin@gmail.com')
  ) THEN (SELECT id FROM mother)
  ELSE (SELECT id FROM personal WHERE personal.user_id = ra.user_id)
END
WHERE ra.role IN ('admin', 'superadmin')
  AND ra.organization_id IS NULL
  AND (
    ra.user_id IN (SELECT id FROM auth.users WHERE email IN ('carlo.spada22@gmail.com', 'ruizvasquezyazmin@gmail.com'))
    OR ra.user_id IN (SELECT user_id FROM personal)
  );

-- 5) Enforce constraint for admins/superadmins (already done in previous migration, but ensure it exists)
ALTER TABLE role_assignments
  DROP CONSTRAINT IF EXISTS role_assignments_org_required_for_staff;

ALTER TABLE role_assignments
  ADD CONSTRAINT role_assignments_org_required_for_staff
  CHECK (
    role NOT IN ('admin', 'superadmin')
    OR organization_id IS NOT NULL
  );

-- 6) Add constraint for agent_level → organization_id not null
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_agent_requires_org;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_agent_requires_org
  CHECK (
    agent_level IS NULL
    OR organization_id IS NOT NULL
  );