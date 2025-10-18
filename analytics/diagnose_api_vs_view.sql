-- Diagnose: Why does the API return 74 rows when the view has 84?

-- 1. Count what the API query would return (matching the API logic exactly)
WITH api_query AS (
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
    divergence_score,
    spread_score
  FROM public_farcaster_spectrums
  ORDER BY created_at DESC
  LIMIT 100
)
SELECT 'API-style query result' as source, COUNT(*) as count
FROM api_query;

-- 2. Check if there are duplicates or invalid data that might be filtered
SELECT 
  'Duplicate FIDs in view' as issue,
  fid,
  COUNT(*) as duplicate_count
FROM public_farcaster_spectrums
GROUP BY fid
HAVING COUNT(*) > 1;

-- 3. Check for any rows with invalid/problematic values
SELECT 
  'Rows with potential issues' as category,
  COUNT(*) as count,
  'Empty username' as issue_type
FROM public_farcaster_spectrums
WHERE username IS NULL OR username = ''
UNION ALL
SELECT 
  'Rows with potential issues',
  COUNT(*),
  'Invalid divergence (< 0 or > 10)'
FROM public_farcaster_spectrums
WHERE divergence_score < 0 OR divergence_score > 10
UNION ALL
SELECT 
  'Rows with potential issues',
  COUNT(*),
  'Invalid spread (< 0 or > 10)'
FROM public_farcaster_spectrums
WHERE spread_score < 0 OR spread_score > 10;

-- 4. Check the actual row count the API would see
SELECT COUNT(*) as total_in_view
FROM public_farcaster_spectrums;

-- 5. Compare first 100 rows by created_at DESC (what API returns by default)
SELECT 
  id,
  fid,
  username,
  created_at,
  divergence_score,
  spread_score
FROM public_farcaster_spectrums
ORDER BY created_at DESC
LIMIT 100;

-- 6. Check if there's a pattern in the missing 10 rows
-- Get all 84 FIDs from view
CREATE TEMP TABLE all_view_fids AS
SELECT fid, created_at, username
FROM public_farcaster_spectrums
ORDER BY created_at DESC;

-- This would need the actual 74 FIDs from the API to compare
-- But we can at least see if there's a pattern in the data
SELECT 
  'Oldest 10 rows (possibly missing)' as category,
  fid,
  username,
  created_at
FROM public_farcaster_spectrums
ORDER BY created_at ASC
LIMIT 10;

-- 7. Check if username or other fields have special characters that might cause issues
SELECT 
  'Rows with special chars' as category,
  COUNT(*) as count
FROM public_farcaster_spectrums
WHERE username ~ '[^\x00-\x7F]' -- non-ASCII characters
   OR display_name ~ '[^\x00-\x7F]';
