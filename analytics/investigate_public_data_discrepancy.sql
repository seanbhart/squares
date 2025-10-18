-- Investigation: Public Data Discrepancies
-- Comparing farcaster_spectrums (is_public=TRUE) vs public_farcaster_spectrums view vs API results

-- 1. Count in base table with is_public=TRUE
SELECT 
  'Base table (is_public=TRUE)' as source,
  COUNT(*) as total_count,
  COUNT(CASE WHEN trade_score IS NULL THEN 1 END) as null_trade,
  COUNT(CASE WHEN abortion_score IS NULL THEN 1 END) as null_abortion,
  COUNT(CASE WHEN migration_score IS NULL THEN 1 END) as null_migration,
  COUNT(CASE WHEN economics_score IS NULL THEN 1 END) as null_economics,
  COUNT(CASE WHEN rights_score IS NULL THEN 1 END) as null_rights,
  COUNT(CASE WHEN username IS NULL OR username = '' THEN 1 END) as null_username
FROM farcaster_spectrums
WHERE is_public = true;

-- 2. Count in public view
SELECT 
  'Public view' as source,
  COUNT(*) as total_count,
  COUNT(CASE WHEN divergence_score IS NULL THEN 1 END) as null_divergence,
  COUNT(CASE WHEN spread_score IS NULL THEN 1 END) as null_spread,
  COUNT(CASE WHEN username IS NULL OR username = '' THEN 1 END) as null_username
FROM public_farcaster_spectrums;

-- 3. Find rows in base table but NOT in view
-- This will show us which rows are being filtered out
SELECT 
  'Missing from view' as issue,
  fs.id,
  fs.fid,
  fs.username,
  fs.trade_score,
  fs.abortion_score,
  fs.migration_score,
  fs.economics_score,
  fs.rights_score,
  fs.is_public,
  fs.created_at
FROM farcaster_spectrums fs
WHERE fs.is_public = true
  AND NOT EXISTS (
    SELECT 1 
    FROM public_farcaster_spectrums pfs 
    WHERE pfs.id = fs.id
  );

-- 4. Check for NULL or problematic values that might cause view to filter them
SELECT 
  'Rows with NULL scores' as issue,
  id,
  fid,
  username,
  trade_score IS NULL as null_trade,
  abortion_score IS NULL as null_abortion,
  migration_score IS NULL as null_migration,
  economics_score IS NULL as null_economics,
  rights_score IS NULL as null_rights
FROM farcaster_spectrums
WHERE is_public = true
  AND (
    trade_score IS NULL OR
    abortion_score IS NULL OR
    migration_score IS NULL OR
    economics_score IS NULL OR
    rights_score IS NULL
  );

-- 5. Check the view definition directly
-- This might show if there's any hidden filtering
SELECT 
  definition 
FROM pg_views 
WHERE viewname = 'public_farcaster_spectrums';

-- 6. Check for RLS policies on the view
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'public_farcaster_spectrums';

-- 7. Test the exact calculations from the view to see if any produce NULL
SELECT 
  id,
  fid,
  username,
  -- Test divergence calculation
  SQRT(
    (POWER(trade_score - 3, 2) + 
     POWER(abortion_score - 3, 2) + 
     POWER(migration_score - 3, 2) + 
     POWER(economics_score - 3, 2) + 
     POWER(rights_score - 3, 2)) / 5.0
  ) as divergence_score,
  -- Test spread calculation
  SQRT(
    (POWER(trade_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2) +
     POWER(abortion_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2) +
     POWER(migration_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2) +
     POWER(economics_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2) +
     POWER(rights_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2)) / 5.0
  ) as spread_score
FROM farcaster_spectrums
WHERE is_public = true
  AND (
    SQRT(
      (POWER(trade_score - 3, 2) + 
       POWER(abortion_score - 3, 2) + 
       POWER(migration_score - 3, 2) + 
       POWER(economics_score - 3, 2) + 
       POWER(rights_score - 3, 2)) / 5.0
    ) IS NULL
    OR
    SQRT(
      (POWER(trade_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2) +
       POWER(abortion_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2) +
       POWER(migration_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2) +
       POWER(economics_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2) +
       POWER(rights_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2)) / 5.0
    ) IS NULL
  );
