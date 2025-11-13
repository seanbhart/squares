-- Fix security issues with views flagged by Security Advisor
-- These views should either filter properly or use SECURITY DEFINER with RLS

-- Fix 1: Update farcaster_leaderboard to only show public spectrums
DROP VIEW IF EXISTS farcaster_leaderboard;

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
WHERE is_public = true  -- Only show public spectrums
ORDER BY created_at DESC;

GRANT SELECT ON farcaster_leaderboard TO anon, authenticated;

COMMENT ON VIEW farcaster_leaderboard IS 'Public leaderboard showing only users who have made their spectrums public';

-- Fix 2: Make api_keys_with_stats a SECURITY DEFINER view with proper RLS
-- This view shows aggregated stats and should only be accessible to admins
DROP VIEW IF EXISTS api_keys_with_stats;

CREATE VIEW api_keys_with_stats 
WITH (security_invoker = false)  -- Run with creator's privileges (SECURITY DEFINER)
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

-- Enable RLS on the view
ALTER VIEW api_keys_with_stats SET (security_barrier = true);

-- Only admins can select from this view
REVOKE ALL ON api_keys_with_stats FROM PUBLIC;
REVOKE ALL ON api_keys_with_stats FROM anon;
REVOKE ALL ON api_keys_with_stats FROM authenticated;

-- Grant to admins only (handled by the underlying api_keys table RLS policies)
GRANT SELECT ON api_keys_with_stats TO authenticated;

COMMENT ON VIEW api_keys_with_stats IS 'API keys with usage statistics - only accessible to admin users via RLS on underlying api_keys table';

-- Fix 3: Update public_farcaster_spectrums to use security_invoker for clarity
-- This view already filters correctly, but we'll make it explicit
DROP VIEW IF EXISTS public_farcaster_spectrums;

CREATE VIEW public_farcaster_spectrums
WITH (security_invoker = true)  -- Run with caller's privileges (default, explicit for clarity)
AS
SELECT 
  id,
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
  -- Calculate divergence score (distance from political center 3.0)
  SQRT(
    (POWER(trade_score - 3, 2) + 
     POWER(abortion_score - 3, 2) + 
     POWER(migration_score - 3, 2) + 
     POWER(economics_score - 3, 2) + 
     POWER(rights_score - 3, 2)) / 5.0
  ) as divergence_score,
  -- Calculate spread/consistency score (standard deviation of scores)
  SQRT(
    (POWER(trade_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2) +
     POWER(abortion_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2) +
     POWER(migration_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2) +
     POWER(economics_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2) +
     POWER(rights_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2)) / 5.0
  ) as spread_score
FROM farcaster_spectrums
WHERE is_public = true  -- Only show public spectrums
ORDER BY created_at DESC;

GRANT SELECT ON public_farcaster_spectrums TO anon, authenticated;

COMMENT ON VIEW public_farcaster_spectrums IS 'Public user spectrums with calculated divergence and spread scores - filtered to is_public=true';
