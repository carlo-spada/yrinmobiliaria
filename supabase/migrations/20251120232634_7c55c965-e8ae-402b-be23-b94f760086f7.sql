-- ============================================
-- MULTI-TENANT FOUNDATION - PART 1
-- Add superadmin enum value (must be committed first)
-- ============================================

-- Add superadmin role to enum
DO $$ BEGIN
  ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'superadmin';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;