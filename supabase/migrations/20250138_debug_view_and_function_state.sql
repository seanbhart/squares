-- Debug script to check actual view and function definitions
-- Run this to see what's really in the database

-- Check view definitions
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views
WHERE viewname IN ('farcaster_leaderboard', 'api_keys_with_stats')
ORDER BY viewname;

-- Check view options (this shows security_barrier setting)
SELECT 
  c.relname as view_name,
  c.reloptions as options
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'v'
  AND n.nspname = 'public'
  AND c.relname IN ('farcaster_leaderboard', 'api_keys_with_stats');

-- Check function definitions and search_path
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as full_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('update_figure_spectrum', 'insert_figure_with_timeline', 'is_admin')
ORDER BY p.proname;

-- Check specifically for search_path configuration on functions
SELECT 
  p.proname as function_name,
  p.proconfig as config_settings
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('update_figure_spectrum', 'insert_figure_with_timeline', 'is_admin')
ORDER BY p.proname;
