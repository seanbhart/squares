-- Add is_public column to farcaster_spectrums
ALTER TABLE farcaster_spectrums 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Drop and recreate the leaderboard view to include is_public
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
ORDER BY created_at DESC;
