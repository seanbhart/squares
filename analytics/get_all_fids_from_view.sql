-- Get all FIDs from the public view for comparison with API response
-- Run this and save the results, then compare with the FIDs from the API

SELECT 
  fid,
  username,
  created_at,
  divergence_score,
  spread_score
FROM public_farcaster_spectrums
ORDER BY fid ASC;

-- Alternative: Just get the FIDs as a simple list
SELECT fid 
FROM public_farcaster_spectrums
ORDER BY fid ASC;

-- Count by creation date to see if older rows are missing
SELECT 
  DATE(created_at) as date,
  COUNT(*) as count
FROM public_farcaster_spectrums
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) ASC;
