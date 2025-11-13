-- Remove security_barrier from views to eliminate SECURITY DEFINER warnings
-- These views were created with security_barrier=true in previous migrations
-- We need to recreate them as completely plain views

-- Fix 1: Recreate farcaster_leaderboard without security_barrier
DROP VIEW IF EXISTS farcaster_leaderboard CASCADE;

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

-- Fix 2: Recreate api_keys_with_stats without security_barrier
DROP VIEW IF EXISTS api_keys_with_stats CASCADE;

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

COMMENT ON VIEW farcaster_leaderboard IS 'Public leaderboard - plain view filtered by is_public=true (no SECURITY DEFINER)';
COMMENT ON VIEW api_keys_with_stats IS 'API keys with stats - plain view protected by underlying api_keys RLS (no SECURITY DEFINER)';
