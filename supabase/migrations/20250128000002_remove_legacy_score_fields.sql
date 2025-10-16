-- Remove legacy diversity_score and extremity_score fields from public view
-- Keep only divergence_score (primary) and spread_score

-- Drop and recreate the view without legacy fields
DROP VIEW IF EXISTS public_farcaster_spectrums;

CREATE VIEW public_farcaster_spectrums AS
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
  -- Higher = more varied positions, Lower = more consistent positions
  SQRT(
    (POWER(trade_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2) +
     POWER(abortion_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2) +
     POWER(migration_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2) +
     POWER(economics_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2) +
     POWER(rights_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2)) / 5.0
  ) as spread_score
FROM farcaster_spectrums
WHERE is_public = true
ORDER BY created_at DESC;

-- Grant access to the view
GRANT SELECT ON public_farcaster_spectrums TO anon, authenticated;

-- Add helpful comment
COMMENT ON VIEW public_farcaster_spectrums IS 'Public user spectrums with calculated divergence (distance from center) and spread (variance across dimensions) scores';
