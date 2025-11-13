-- Fix remaining security definer views and function search_path issues

-- Fix 1: Recreate views WITHOUT any security properties
-- Drop and recreate as completely plain views
DROP VIEW IF EXISTS farcaster_leaderboard CASCADE;
DROP VIEW IF EXISTS api_keys_with_stats CASCADE;

-- Plain view for farcaster_leaderboard (no security properties at all)
CREATE VIEW farcaster_leaderboard AS
SELECT 
  fid,
  username,
  display_name,
  pfp_url,
  trade_score,
  abortion_score,
  migration_score,
  economics_score,
  rights_score,
  times_updated,
  created_at,
  updated_at,
  is_public,
  SQRT(
    (POWER(trade_score - 3, 2) + 
     POWER(abortion_score - 3, 2) + 
     POWER(migration_score - 3, 2) + 
     POWER(economics_score - 3, 2) + 
     POWER(rights_score - 3, 2)) / 5.0
  ) as diversity_score
FROM farcaster_spectrums
WHERE is_public = true;

GRANT SELECT ON farcaster_leaderboard TO anon, authenticated;

-- Plain view for api_keys_with_stats (no security properties at all)
CREATE VIEW api_keys_with_stats AS
SELECT 
  k.id,
  k.key_prefix,
  k.name,
  k.organization,
  k.contact_email,
  k.tier,
  k.status,
  k.rate_limit_per_minute,
  k.rate_limit_per_day,
  k.usage_count,
  k.last_used_at,
  k.created_at,
  k.expires_at,
  COALESCE(
    (SELECT COUNT(*) FROM api_usage_logs WHERE api_key_id = k.id AND created_at >= NOW() - INTERVAL '24 hours'),
    0
  ) as requests_last_24h,
  COALESCE(
    (SELECT COUNT(*) FROM api_usage_logs WHERE api_key_id = k.id AND created_at >= NOW() - INTERVAL '7 days'),
    0
  ) as requests_last_7d,
  COALESCE(
    (SELECT COUNT(*) FROM api_usage_logs WHERE api_key_id = k.id AND created_at >= NOW() - INTERVAL '30 days'),
    0
  ) as requests_last_30d
FROM api_keys k;

GRANT SELECT ON api_keys_with_stats TO authenticated;

-- Fix 2: Add search_path to remaining functions
-- Fix update_figure_spectrum (recreate with search_path)
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

-- Fix insert_figure_with_timeline (the actual function name)
CREATE OR REPLACE FUNCTION insert_figure_with_timeline(
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

-- Add comments (with full signatures for overloaded functions)
COMMENT ON VIEW farcaster_leaderboard IS 'Public leaderboard - plain view with WHERE is_public filter';
COMMENT ON VIEW api_keys_with_stats IS 'API keys with stats - plain view protected by underlying RLS';
COMMENT ON FUNCTION update_figure_spectrum(UUID, JSONB) IS 'Update figure spectrum with secure search_path';
COMMENT ON FUNCTION insert_figure_with_timeline(TEXT, TEXT, TEXT, JSONB) IS 'Insert figure with timeline with secure search_path';
COMMENT ON FUNCTION is_admin() IS 'Check if current user is admin with secure search_path';
