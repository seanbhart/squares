-- Fix "Function Search Path Mutable" warnings by setting search_path on functions
-- This prevents potential SQL injection via search_path manipulation

-- Fix increment_api_key_usage function
CREATE OR REPLACE FUNCTION increment_api_key_usage(key_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE api_keys
  SET usage_count = usage_count + 1,
      last_used_at = NOW()
  WHERE id = key_id;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix get_api_key_stats function
CREATE OR REPLACE FUNCTION get_api_key_stats(key_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_requests', COUNT(*),
    'successful_requests', COUNT(*) FILTER (WHERE success = true),
    'failed_requests', COUNT(*) FILTER (WHERE success = false),
    'total_tokens', COALESCE(SUM(ai_tokens_used), 0),
    'total_cost', COALESCE(SUM(ai_cost_usd), 0),
    'avg_processing_time_ms', COALESCE(AVG(processing_time_ms), 0),
    'last_request_at', MAX(created_at)
  ) INTO result
  FROM api_usage_logs
  WHERE api_key_id = key_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix cleanup_old_usage_logs function
CREATE OR REPLACE FUNCTION cleanup_old_usage_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM api_usage_logs
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix update_farcaster_spectrum timestamp function
CREATE OR REPLACE FUNCTION update_farcaster_spectrum_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

-- Note: Functions with TABLE return types (get_all_figures, get_featured_figures, etc.)
-- are handled in migration 20250134_drop_and_recreate_functions.sql
-- because they require DROP before CREATE to change signatures

COMMENT ON FUNCTION increment_api_key_usage IS 'Increment API key usage counter with secure search_path';
COMMENT ON FUNCTION get_api_key_stats IS 'Get API key statistics with secure search_path';
COMMENT ON FUNCTION cleanup_old_usage_logs IS 'Clean up old usage logs with secure search_path';
