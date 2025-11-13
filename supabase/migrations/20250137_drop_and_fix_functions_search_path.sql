-- Drop and recreate functions with search_path to fix remaining warnings
-- Functions must be dropped first because CREATE OR REPLACE doesn't change search_path

-- Drop the problematic functions
DROP FUNCTION IF EXISTS update_figure_spectrum(UUID, JSONB) CASCADE;
DROP FUNCTION IF EXISTS insert_figure_with_timeline(TEXT, TEXT, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;

-- Recreate update_figure_spectrum with search_path
CREATE FUNCTION update_figure_spectrum(
  figure_id UUID,
  new_spectrum JSONB
)
RETURNS VOID AS $$
BEGIN
  UPDATE figures
  SET spectrum = new_spectrum,
      updated_at = NOW()
  WHERE id = figure_id;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- Recreate insert_figure_with_timeline with search_path
CREATE FUNCTION insert_figure_with_timeline(
  figure_name TEXT,
  figure_description TEXT,
  figure_pfp_url TEXT,
  figure_spectrum JSONB
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO figures (name, description, pfp_url, spectrum)
  VALUES (figure_name, figure_description, figure_pfp_url, figure_spectrum)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- Recreate is_admin with search_path
CREATE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND 'admin' = ANY(users.roles)
  );
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

COMMENT ON FUNCTION update_figure_spectrum(UUID, JSONB) IS 'Update figure spectrum - secured with search_path';
COMMENT ON FUNCTION insert_figure_with_timeline(TEXT, TEXT, TEXT, JSONB) IS 'Insert figure with timeline - secured with search_path';
COMMENT ON FUNCTION is_admin() IS 'Check if current user is admin - secured with search_path';
