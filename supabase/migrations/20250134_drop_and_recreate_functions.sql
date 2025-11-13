-- Drop and recreate functions with correct signatures and search_path
-- This fixes the "cannot change return type" error

-- Drop all affected functions first
DROP FUNCTION IF EXISTS get_all_figures() CASCADE;
DROP FUNCTION IF EXISTS get_featured_figures() CASCADE;
DROP FUNCTION IF EXISTS get_figure_by_name(TEXT) CASCADE;
DROP FUNCTION IF EXISTS update_figure_spectrum(UUID, JSONB) CASCADE;
DROP FUNCTION IF EXISTS insert_figure_with_time1(TEXT, TEXT, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS current_user_is_admin() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Now recreate them with search_path set

-- Fix get_all_figures function
CREATE OR REPLACE FUNCTION get_all_figures()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  pfp_url TEXT,
  spectrum JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    f.description,
    f.pfp_url,
    f.spectrum,
    f.created_at,
    f.updated_at
  FROM figures f
  ORDER BY f.name;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix get_featured_figures function
CREATE OR REPLACE FUNCTION get_featured_figures()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  pfp_url TEXT,
  spectrum JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    f.description,
    f.pfp_url,
    f.spectrum,
    f.created_at,
    f.updated_at
  FROM figures f
  WHERE f.is_featured = true
  ORDER BY f.name;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix get_figure_by_name function
CREATE OR REPLACE FUNCTION get_figure_by_name(figure_name TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  pfp_url TEXT,
  spectrum JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    f.description,
    f.pfp_url,
    f.spectrum,
    f.created_at,
    f.updated_at
  FROM figures f
  WHERE f.name = figure_name;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix update_figure_spectrum function
CREATE OR REPLACE FUNCTION update_figure_spectrum(
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

-- Fix insert_figure_with_time1 function
CREATE OR REPLACE FUNCTION insert_figure_with_time1(
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

-- Fix is_admin function
CREATE OR REPLACE FUNCTION is_admin()
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

-- Fix current_user_is_admin function
CREATE OR REPLACE FUNCTION current_user_is_admin()
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

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, roles)
  VALUES (
    NEW.id,
    NEW.email,
    ARRAY['user']::TEXT[]
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;
