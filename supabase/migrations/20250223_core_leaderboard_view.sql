-- Create a CORE-based leaderboard view with diversity score based on 4 CORE dimensions
-- This replaces the TAMER-based farcaster_leaderboard view for the miniapp

CREATE OR REPLACE VIEW core_leaderboard AS
SELECT
  fs.id,
  fs.fid,
  fs.username,
  fs.display_name,
  fs.pfp_url,
  -- CORE scores (either user-set or auto-converted)
  COALESCE(fs.civil_rights_score, converted.civil_rights_score) as civil_rights_score,
  COALESCE(fs.openness_score, converted.openness_score) as openness_score,
  COALESCE(fs.redistribution_score, converted.redistribution_score) as redistribution_score,
  COALESCE(fs.ethics_score, converted.ethics_score) as ethics_score,
  fs.core_is_user_set,
  -- Metadata
  fs.is_public,
  fs.times_updated,
  fs.created_at,
  fs.updated_at,
  -- Calculate CORE diversity score (standard deviation from midpoint 2.5 on 0-5 scale)
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

-- Grant access to view
GRANT SELECT ON core_leaderboard TO anon, authenticated;

-- Add comment for documentation
COMMENT ON VIEW core_leaderboard IS 'CORE-based leaderboard with diversity score calculated from 4 CORE dimensions (midpoint 2.5 on 0-5 scale)';
