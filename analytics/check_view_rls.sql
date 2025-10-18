-- Check if there are any RLS policies on the view or underlying table
-- that might cause different results with different query patterns

-- 1. Check RLS status on the view and table
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('farcaster_spectrums', 'public_farcaster_spectrums');

-- 2. Check all policies on related tables/views
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('farcaster_spectrums', 'public_farcaster_spectrums');

-- 3. Test the exact query the API would run with service role
-- This simulates what happens with limit=100
SELECT COUNT(*) as count_with_limit_100
FROM (
  SELECT * 
  FROM public_farcaster_spectrums
  ORDER BY created_at DESC
  LIMIT 100
) subquery;

-- 4. Check if there's a PostgREST max-rows setting by testing different limits
SELECT 'limit=50' as test, COUNT(*) as actual_count
FROM (SELECT * FROM public_farcaster_spectrums ORDER BY created_at DESC LIMIT 50) t
UNION ALL
SELECT 'limit=75', COUNT(*)
FROM (SELECT * FROM public_farcaster_spectrums ORDER BY created_at DESC LIMIT 75) t
UNION ALL
SELECT 'limit=100', COUNT(*)
FROM (SELECT * FROM public_farcaster_spectrums ORDER BY created_at DESC LIMIT 100) t
UNION ALL
SELECT 'limit=150', COUNT(*)
FROM (SELECT * FROM public_farcaster_spectrums ORDER BY created_at DESC LIMIT 150) t;

-- 5. Check if the view itself has any hidden WHERE clause or filter
SELECT pg_get_viewdef('public_farcaster_spectrums'::regclass, true);
