-- Emergency Fix: Restore Superadmin Access
-- Run this if you are locked out after the migration

-- 1. Force update the role for Carlo
UPDATE public.users 
SET role = 'superadmin'::user_role,
    organization_id = NULL -- Superadmin has no org
WHERE email = 'carlo.spada22@gmail.com';

-- 2. Force update the role for Yasmin (if she exists)
UPDATE public.users 
SET role = 'admin'::user_role
WHERE email = 'ruizvasquezyazmin@gmail.com';

-- 3. Verify the change
SELECT email, role FROM public.users WHERE email IN ('carlo.spada22@gmail.com', 'ruizvasquezyazmin@gmail.com');
