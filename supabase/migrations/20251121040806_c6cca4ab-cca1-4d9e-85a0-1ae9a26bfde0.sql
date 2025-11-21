-- ============================================================================
-- CREATE MISSING USER PROFILE AUTO-CREATION TRIGGERS
-- ============================================================================
-- These triggers are critical for maintaining data consistency between
-- auth.users and public.profiles/role_assignments tables

-- Drop triggers if they exist (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_email_changed ON auth.users;

-- Create trigger for auto-creating profiles on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for syncing email changes
CREATE TRIGGER on_auth_user_email_changed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.sync_user_email();