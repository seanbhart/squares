-- Remove SECURITY DEFINER from views to fix security warnings
-- Create simple views that respect RLS from underlying tables

-- Fix 1: Recreate farcaster_leaderboard as a simple view (no SECURITY DEFINER)
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
  -- Calculate diversity score (standard deviation of scores)
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

COMMENT ON VIEW farcaster_leaderboard IS 'Public leaderboard - security enforced by WHERE is_public = true filter';

-- Fix 2: Recreate api_keys_with_stats as a simple view (no SECURITY DEFINER)
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

-- The RLS policies on api_keys table will automatically restrict access
GRANT SELECT ON api_keys_with_stats TO authenticated;

COMMENT ON VIEW api_keys_with_stats IS 'API keys with usage statistics - security enforced by RLS policies on underlying api_keys table';
