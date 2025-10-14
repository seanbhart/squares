/**
 * Type definitions for API system
 */

export type ApiKeyTier = 'free' | 'standard' | 'enterprise';
export type ApiKeyStatus = 'active' | 'suspended' | 'revoked';

export interface ApiKey {
  id: string;
  key_hash: string;
  key_prefix: string;
  name: string;
  organization: string | null;
  contact_email: string;
  tier: ApiKeyTier;
  status: ApiKeyStatus;
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
  max_batch_size: number;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
  created_by: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  revoked_by: string | null;
  revoke_reason: string | null;
  metadata: Record<string, unknown>;
}

export interface ApiUsageLog {
  id: string;
  api_key_id: string;
  endpoint: string;
  method: string;
  url_analyzed: string | null;
  status_code: number;
  success: boolean;
  error_message: string | null;
  error_code: string | null;
  request_size_bytes: number | null;
  response_size_bytes: number | null;
  processing_time_ms: number | null;
  ai_model: string | null;
  ai_tokens_used: number | null;
  ai_cost_usd: number | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ApiAnalysis {
  id: string;
  api_key_id: string;
  url: string;
  url_hash: string;
  title: string | null;
  excerpt: string | null;
  spectrum: {
    trade: number;
    abortion: number;
    migration: number;
    economics: number;
    rights: number;
  };
  reasoning?: {
    trade: string;
    abortion: string;
    migration: string;
    economics: string;
    rights: string;
  };
  confidence?: {
    trade: number;
    abortion: number;
    migration: number;
    economics: number;
    rights: number;
  };
  emoji_signature: string;
  text_signature: string;
  model: string;
  processing_time_ms: number | null;
  tokens_used: number | null;
  cost_usd: number | null;
  cached: boolean;
  cache_expires_at: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface CreateApiKeyRequest {
  name: string;
  organization?: string;
  contact_email: string;
  tier?: ApiKeyTier;
  expires_at?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateApiKeyResponse {
  api_key: string; // Only time the plaintext key is returned
  key_prefix: string;
  id: string;
  name: string;
  tier: ApiKeyTier;
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
  created_at: string;
  expires_at: string | null;
}

export interface AnalyzeRequest {
  url: string;
  options?: {
    include_reasoning?: boolean;
    include_confidence?: boolean;
    model?: 'gpt-4o-mini' | 'gpt-4o';
  };
}

export interface BatchAnalyzeRequest {
  urls: string[];
  options?: {
    include_reasoning?: boolean;
    include_confidence?: boolean;
    model?: 'gpt-4o-mini' | 'gpt-4o';
  };
}

export interface AnalyzeResponse {
  id: string;
  url: string;
  spectrum: {
    trade: number;
    abortion: number;
    migration: number;
    economics: number;
    rights: number;
  };
  reasoning?: {
    trade: string;
    abortion: string;
    migration: string;
    economics: string;
    rights: string;
  };
  confidence?: {
    trade: number;
    abortion: number;
    migration: number;
    economics: number;
    rights: number;
  };
  emoji_signature: string;
  text_signature: string;
  metadata: {
    title: string | null;
    excerpt: string | null;
    analyzed_at: string;
    processing_time_ms: number | null;
    cached?: boolean;
  };
}

export interface BatchAnalyzeResponse {
  batch_id: string;
  results: Array<{
    url: string;
    status: 'success' | 'failed';
    analysis?: AnalyzeResponse;
    error?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    processing_time_ms: number;
  };
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface RateLimitErrorResponse extends ApiErrorResponse {
  error: 'rate_limit_exceeded';
  retry_after: number; // seconds
}

export interface UsageResponse {
  current_period: {
    period: string;
    requests_count: number;
    requests_limit: number;
    requests_remaining: number;
  };
  rate_limits: {
    per_minute: number;
    per_day: number;
  };
  last_request_at: string | null;
}
