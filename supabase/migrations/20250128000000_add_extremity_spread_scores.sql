-- Add extremity and spread score calculations to public data view
-- Extremity: distance from political center (3.0)
-- Spread: variance/consistency of positions across dimensions

-- Create index for efficient querying of public spectrums (if not exists)
CREATE INDEX IF NOT EXISTS idx_farcaster_spectrums_is_public ON farcaster_spectrums(is_public) WHERE is_public = true;

-- Drop and recreate the view with new score calculations
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
  -- Calculate extremity score (distance from political center 3.0)
  SQRT(
    (POWER(trade_score - 3, 2) + 
     POWER(abortion_score - 3, 2) + 
     POWER(migration_score - 3, 2) + 
     POWER(economics_score - 3, 2) + 
     POWER(rights_score - 3, 2)) / 5.0
  ) as extremity_score,
  -- Calculate spread/consistency score (standard deviation of scores)
  -- Higher = more varied positions, Lower = more consistent positions
  SQRT(
    (POWER(trade_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2) +
     POWER(abortion_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2) +
     POWER(migration_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2) +
     POWER(economics_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2) +
     POWER(rights_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2)) / 5.0
  ) as spread_score,
  -- Keep legacy diversity_score for backwards compatibility (same as extremity)
  SQRT(
    (POWER(trade_score - 3, 2) + 
     POWER(abortion_score - 3, 2) + 
     POWER(migration_score - 3, 2) + 
     POWER(economics_score - 3, 2) + 
     POWER(rights_score - 3, 2)) / 5.0
  ) as diversity_score
FROM farcaster_spectrums
WHERE is_public = true
ORDER BY created_at DESC;

-- Grant access to the view
GRANT SELECT ON public_farcaster_spectrums TO anon, authenticated;

-- Add helpful comment
COMMENT ON VIEW public_farcaster_spectrums IS 'Public user spectrums with calculated extremity (distance from center) and spread (variance across dimensions) scores';
