-- Create api_keys table for external API access
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL, -- e.g., "sq_live_abc..." first 12 chars for identification
  name TEXT NOT NULL, -- e.g., "Acme Corp Production"
  organization TEXT,
  contact_email TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'standard', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
  
  -- Rate limits
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 5,
  rate_limit_per_day INTEGER NOT NULL DEFAULT 100,
  max_batch_size INTEGER NOT NULL DEFAULT 3,
  
  -- Usage tracking
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Key lifecycle
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES users(id) ON DELETE SET NULL,
  revoke_reason TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Indexes for fast lookups
  CONSTRAINT valid_expiration CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- Create indexes
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_status ON api_keys(status) WHERE status = 'active';
CREATE INDEX idx_api_keys_tier ON api_keys(tier);
CREATE INDEX idx_api_keys_created_by ON api_keys(created_by);
CREATE INDEX idx_api_keys_key_prefix ON api_keys(key_prefix);

-- Create api_usage_logs table for detailed request tracking
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  
  -- Request details
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  url_analyzed TEXT, -- The URL that was analyzed (if applicable)
  
  -- Response details  
  status_code INTEGER NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  error_code TEXT,
  
  -- Performance metrics
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  processing_time_ms INTEGER,
  
  -- AI usage tracking
  ai_model TEXT, -- e.g., "gpt-4o-mini"
  ai_tokens_used INTEGER,
  ai_cost_usd DECIMAL(10, 6),
  
  -- Request metadata
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for api_usage_logs
CREATE INDEX idx_api_usage_logs_api_key_id ON api_usage_logs(api_key_id);
CREATE INDEX idx_api_usage_logs_created_at ON api_usage_logs(created_at DESC);
CREATE INDEX idx_api_usage_logs_key_and_time ON api_usage_logs(api_key_id, created_at DESC);
CREATE INDEX idx_api_usage_logs_status ON api_usage_logs(status_code);
CREATE INDEX idx_api_usage_logs_success ON api_usage_logs(success);

-- Create api_analyses table to cache analysis results
CREATE TABLE IF NOT EXISTS api_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  
  -- Content details
  url TEXT NOT NULL,
  url_hash TEXT NOT NULL, -- SHA-256 hash of normalized URL for deduplication
  title TEXT,
  excerpt TEXT,
  
  -- Analysis results
  spectrum JSONB NOT NULL, -- { "trade": 2, "abortion": 4, ... }
  reasoning JSONB, -- { "trade": "explanation...", ... }
  confidence JSONB, -- { "trade": 0.85, ... }
  emoji_signature TEXT, -- "🟩🟧🟨🟥🟦"
  text_signature TEXT, -- "T2 A4 M3 E5 R1"
  
  -- Processing metadata
  model TEXT NOT NULL, -- e.g., "gpt-4o-mini"
  processing_time_ms INTEGER,
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 6),
  
  -- Cache control
  cached BOOLEAN NOT NULL DEFAULT false,
  cache_expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for api_analyses
CREATE INDEX idx_api_analyses_api_key_id ON api_analyses(api_key_id);
CREATE INDEX idx_api_analyses_url_hash ON api_analyses(url_hash);
CREATE INDEX idx_api_analyses_created_at ON api_analyses(created_at DESC);
CREATE INDEX idx_api_analyses_key_and_time ON api_analyses(api_key_id, created_at DESC);

-- Enable RLS on all tables
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_keys

-- Admins can view all API keys
CREATE POLICY "Admins can view all api_keys" ON api_keys
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND 'admin' = ANY(users.roles)
    )
  );

-- Admins can create API keys
CREATE POLICY "Admins can create api_keys" ON api_keys
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND 'admin' = ANY(users.roles)
    )
  );

-- Admins can update API keys
CREATE POLICY "Admins can update api_keys" ON api_keys
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND 'admin' = ANY(users.roles)
    )
  );

-- Admins can delete API keys
CREATE POLICY "Admins can delete api_keys" ON api_keys
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND 'admin' = ANY(users.roles)
    )
  );

-- RLS Policies for api_usage_logs

-- Admins can view all usage logs
CREATE POLICY "Admins can view all usage_logs" ON api_usage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND 'admin' = ANY(users.roles)
    )
  );

-- Service role can insert usage logs (for API requests)
CREATE POLICY "Service can insert usage_logs" ON api_usage_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for api_analyses

-- Admins can view all analyses
CREATE POLICY "Admins can view all analyses" ON api_analyses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND 'admin' = ANY(users.roles)
    )
  );

-- Service role can insert/update analyses (for API requests)
CREATE POLICY "Service can insert analyses" ON api_analyses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can update analyses" ON api_analyses
  FOR UPDATE USING (true);

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_api_key_usage(key_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE api_keys
  SET usage_count = usage_count + 1,
      last_used_at = NOW()
  WHERE id = key_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get API key statistics
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old usage logs (run periodically)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for active API keys with stats
CREATE OR REPLACE VIEW api_keys_with_stats AS
SELECT 
  k.id,
  k.key_prefix,
  k.name,
  k.organization,
  k.contact_email,
  k.tier,
  k.status,
  k.rate_limit_per_minute,
  k.rate_limit_per_day,
  k.usage_count,
  k.last_used_at,
  k.created_at,
  k.expires_at,
  COALESCE(
    (SELECT COUNT(*) FROM api_usage_logs WHERE api_key_id = k.id AND created_at >= NOW() - INTERVAL '24 hours'),
    0
  ) as requests_last_24h,
  COALESCE(
    (SELECT COUNT(*) FROM api_usage_logs WHERE api_key_id = k.id AND created_at >= NOW() - INTERVAL '7 days'),
    0
  ) as requests_last_7d,
  COALESCE(
    (SELECT COUNT(*) FROM api_usage_logs WHERE api_key_id = k.id AND created_at >= NOW() - INTERVAL '30 days'),
    0
  ) as requests_last_30d
FROM api_keys k;

-- Grant permissions for the view
GRANT SELECT ON api_keys_with_stats TO authenticated;

COMMENT ON TABLE api_keys IS 'External API keys for accessing Squares analysis services';
COMMENT ON TABLE api_usage_logs IS 'Detailed logs of all API requests';
COMMENT ON TABLE api_analyses IS 'Cached content analysis results';
COMMENT ON VIEW api_keys_with_stats IS 'API keys with aggregated usage statistics';
