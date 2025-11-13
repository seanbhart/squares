-- ========================================
-- DIAGNOSTIC QUERIES FOR SECURITY ISSUES
-- Run these in Supabase SQL Editor to see actual database state
-- ========================================

-- 1. Check view options (shows if security_barrier or security_invoker is set)
SELECT 
  c.relname as view_name,
  c.reloptions as options,
  CASE 
    WHEN c.reloptions IS NULL THEN 'No special options (plain view)'
    WHEN 'security_barrier=on' = ANY(c.reloptions) THEN 'Has security_barrier=on (SECURITY DEFINER)'
    WHEN 'security_barrier=off' = ANY(c.reloptions) THEN 'Has security_barrier=off'
    WHEN 'security_invoker=on' = ANY(c.reloptions) THEN 'Has security_invoker=on (caller privileges)'
    WHEN 'security_invoker=off' = ANY(c.reloptions) THEN 'Has security_invoker=off (SECURITY DEFINER)'
    ELSE 'Other options'
  END as security_mode
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'v'
  AND n.nspname = 'public'
  AND c.relname IN ('farcaster_leaderboard', 'api_keys_with_stats', 'public_farcaster_spectrums');

-- 2. Check function proconfig (shows search_path and other settings)
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  p.proconfig as config_settings,
  CASE 
    WHEN p.proconfig IS NULL THEN 'No search_path set (MUTABLE)'
    WHEN EXISTS (SELECT 1 FROM unnest(p.proconfig) WHERE unnest LIKE 'search_path%') THEN 'search_path IS SET'
    ELSE 'No search_path (MUTABLE)'
  END as search_path_status,
  p.prosecdef as is_security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('update_figure_spectrum', 'insert_figure_with_timeline', 'is_admin', 
                    'increment_api_key_usage', 'get_api_key_stats', 'cleanup_old_usage_logs',
                    'update_farcaster_spectrum_timestamp')
ORDER BY p.proname, pg_get_function_arguments(p.oid);

-- 3. Get the FULL definition of problematic views
SELECT 
  viewname,
  definition
FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN ('farcaster_leaderboard', 'api_keys_with_stats')
ORDER BY viewname;

-- 4. Get the FULL definition of problematic functions
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as full_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('update_figure_spectrum', 'insert_figure_with_timeline', 'is_admin')
ORDER BY p.proname, pg_get_function_arguments(p.oid)
LIMIT 10;

-- 5. List ALL views in public schema to see if there are duplicates
SELECT 
  schemaname,
  viewname,
  viewowner
FROM pg_views
WHERE schemaname = 'public'
ORDER BY viewname;

-- 6. Check migration history to see what's been applied
SELECT 
  version,
  name,
  inserted_at
FROM supabase_migrations.schema_migrations
WHERE version >= '20250130'
ORDER BY version DESC
LIMIT 20;
