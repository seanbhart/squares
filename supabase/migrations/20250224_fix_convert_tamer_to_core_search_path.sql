-- Fix convert_tamer_to_core function with proper search_path setting
-- This addresses the security warning about mutable search_path
-- Note: Views that depend on this function will be dropped and recreated

-- First drop the dependent views
DROP VIEW IF EXISTS core_leaderboard;
DROP VIEW IF EXISTS public_core_spectrums;

-- Drop the function (now safe since views are dropped)
DROP FUNCTION IF EXISTS convert_tamer_to_core(SMALLINT, SMALLINT, SMALLINT, SMALLINT, SMALLINT);

-- Recreate function with proper search_path
CREATE OR REPLACE FUNCTION convert_tamer_to_core(
  p_trade_score SMALLINT,
  p_abortion_score SMALLINT,
  p_migration_score SMALLINT,
  p_economics_score SMALLINT,
  p_rights_score SMALLINT
) RETURNS TABLE (
  civil_rights_score SMALLINT,
  openness_score SMALLINT,
  redistribution_score SMALLINT,
  ethics_score SMALLINT
)
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v_civil_rights_raw NUMERIC;
  v_openness_raw NUMERIC;
  v_redistribution_raw NUMERIC;
  v_ethics_raw NUMERIC;
BEGIN
  -- Civil Rights: average of rights and abortion, scaled from 0-6 to 0-5
  v_civil_rights_raw := (p_rights_score + p_abortion_score) / 2.0;
  civil_rights_score := ROUND((v_civil_rights_raw / 6.0) * 5.0)::SMALLINT;

  -- Openness: average of migration and trade, scaled from 0-6 to 0-5
  v_openness_raw := (p_migration_score + p_trade_score) / 2.0;
  openness_score := ROUND((v_openness_raw / 6.0) * 5.0)::SMALLINT;

  -- Redistribution: economics directly scaled from 0-6 to 0-5
  redistribution_score := ROUND((p_economics_score / 6.0) * 5.0)::SMALLINT;

  -- Ethics: weighted average (abortion 60%, rights 40%), scaled from 0-6 to 0-5
  v_ethics_raw := (p_abortion_score * 0.6 + p_rights_score * 0.4);
  ethics_score := ROUND((v_ethics_raw / 6.0) * 5.0)::SMALLINT;

  RETURN NEXT;
END;
$$;

COMMENT ON FUNCTION convert_tamer_to_core(SMALLINT, SMALLINT, SMALLINT, SMALLINT, SMALLINT)
IS 'Converts TAMER scores (0-6 scale) to CORE scores (0-5 scale). Uses secure search_path.';

-- Recreate the public_core_spectrums view
CREATE VIEW public_core_spectrums
WITH (security_invoker = true)
AS
SELECT
  fs.id,
  fs.fid,
  fs.username,
  fs.display_name,
  fs.pfp_url,
  COALESCE(fs.civil_rights_score, converted.civil_rights_score) as civil_rights_score,
  COALESCE(fs.openness_score, converted.openness_score) as openness_score,
  COALESCE(fs.redistribution_score, converted.redistribution_score) as redistribution_score,
  COALESCE(fs.ethics_score, converted.ethics_score) as ethics_score,
  fs.core_is_user_set,
  fs.trade_score,
  fs.abortion_score,
  fs.migration_score,
  fs.economics_score,
  fs.rights_score,
  fs.is_public,
  fs.times_updated,
  fs.created_at,
  fs.updated_at
FROM farcaster_spectrums fs
LEFT JOIN LATERAL convert_tamer_to_core(
  fs.trade_score,
  fs.abortion_score,
  fs.migration_score,
  fs.economics_score,
  fs.rights_score
) AS converted ON true
WHERE fs.is_public = true;

GRANT SELECT ON public_core_spectrums TO anon, authenticated;
COMMENT ON VIEW public_core_spectrums IS 'Public view of CORE scores with SECURITY INVOKER for proper RLS enforcement.';

-- Recreate the core_leaderboard view
CREATE VIEW core_leaderboard
WITH (security_invoker = true)
AS SELECT
  fs.id,
  fs.fid,
  fs.username,
  fs.display_name,
  fs.pfp_url,
  COALESCE(fs.civil_rights_score, converted.civil_rights_score) as civil_rights_score,
  COALESCE(fs.openness_score, converted.openness_score) as openness_score,
  COALESCE(fs.redistribution_score, converted.redistribution_score) as redistribution_score,
  COALESCE(fs.ethics_score, converted.ethics_score) as ethics_score,
  fs.core_is_user_set,
  fs.is_public,
  fs.times_updated,
  fs.created_at,
  fs.updated_at,
  SQRT(
    (POWER(COALESCE(fs.civil_rights_score, converted.civil_rights_score) - 2.5, 2) +
     POWER(COALESCE(fs.openness_score, converted.openness_score) - 2.5, 2) +
     POWER(COALESCE(fs.redistribution_score, converted.redistribution_score) - 2.5, 2) +
     POWER(COALESCE(fs.ethics_score, converted.ethics_score) - 2.5, 2)) / 4.0
  ) as diversity_score
FROM farcaster_spectrums fs
LEFT JOIN LATERAL convert_tamer_to_core(
  fs.trade_score,
  fs.abortion_score,
  fs.migration_score,
  fs.economics_score,
  fs.rights_score
) AS converted ON true
WHERE fs.is_public = true
ORDER BY fs.created_at DESC;

GRANT SELECT ON core_leaderboard TO anon, authenticated;
COMMENT ON VIEW core_leaderboard IS 'CORE-based leaderboard with diversity score (midpoint 2.5 on 0-5 scale).';
