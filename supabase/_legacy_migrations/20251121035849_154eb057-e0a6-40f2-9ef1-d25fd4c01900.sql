-- Drop the existing admin-only SELECT policy
DROP POLICY IF EXISTS "Admins can view site settings" ON site_settings;

-- Create new public read policy
CREATE POLICY "Anyone can view site settings"
ON site_settings
FOR SELECT
USING (true);

-- Keep existing admin-only policies for INSERT, UPDATE, DELETE (already exist)