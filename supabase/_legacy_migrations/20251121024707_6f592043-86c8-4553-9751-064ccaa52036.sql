-- Grant admin roles to Carlo and Yas
DO $$
DECLARE
  yr_org_id UUID;
  carlo_user_id UUID;
  yas_user_id UUID;
BEGIN
  -- Get YR organization ID
  SELECT id INTO yr_org_id FROM organizations WHERE slug = 'yr-inmobiliaria';

  -- Get user IDs
  SELECT id INTO carlo_user_id FROM auth.users WHERE email = 'carlo.spada22@gmail.com';
  SELECT id INTO yas_user_id FROM auth.users WHERE email = 'ruizvasquezyazmin@gmail.com';

  -- Grant Carlo SuperAdmin role (global)
  IF carlo_user_id IS NOT NULL THEN
    INSERT INTO role_assignments (user_id, organization_id, role, granted_at)
    VALUES (carlo_user_id, NULL, 'superadmin', NOW())
    ON CONFLICT (user_id, organization_id, role) DO NOTHING;
    RAISE NOTICE 'Carlo granted SuperAdmin role';
  ELSE
    RAISE NOTICE 'Carlo not found - sign up first at /auth';
  END IF;

  -- Grant Yas Admin role for YR Inmobiliaria
  IF yas_user_id IS NOT NULL AND yr_org_id IS NOT NULL THEN
    INSERT INTO role_assignments (user_id, organization_id, role, granted_by, granted_at)
    VALUES (yas_user_id, yr_org_id, 'admin', carlo_user_id, NOW())
    ON CONFLICT (user_id, organization_id, role) DO NOTHING;
    RAISE NOTICE 'Yas granted Admin role for YR';
  ELSE
    RAISE NOTICE 'Yas not found or YR org missing';
  END IF;
END $$;