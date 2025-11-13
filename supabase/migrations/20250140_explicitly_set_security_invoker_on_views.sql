-- Explicitly set security_invoker=true on views to satisfy the linter
-- Even though views appear plain, the linter may require explicit security_invoker

-- Recreate farcaster_leaderboard with explicit security_invoker=true
DROP VIEW IF EXISTS farcaster_leaderboard CASCADE;

CREATE VIEW farcaster_leaderboard
WITH (security_invoker=true)
AS
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

-- Recreate api_keys_with_stats with explicit security_invoker=true
DROP VIEW IF EXISTS api_keys_with_stats CASCADE;

CREATE VIEW api_keys_with_stats
WITH (security_invoker=true)
AS
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

COMMENT ON VIEW farcaster_leaderboard IS 'Public leaderboard with explicit security_invoker=true';
COMMENT ON VIEW api_keys_with_stats IS 'API keys with stats with explicit security_invoker=true (RLS from api_keys applies)';
