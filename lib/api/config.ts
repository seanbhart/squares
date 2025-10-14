/**
 * API tier configuration and rate limits
 */

import { ApiKeyTier } from './types';

export interface TierConfig {
  name: string;
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
  max_batch_size: number;
  features: {
    include_reasoning: boolean;
    include_confidence: boolean;
    gpt4_access: boolean;
    priority_processing: boolean;
  };
}

export const TIER_CONFIG: Record<ApiKeyTier, TierConfig> = {
  free: {
    name: 'Free',
    rate_limit_per_minute: 5,
    rate_limit_per_day: 100,
    max_batch_size: 3,
    features: {
      include_reasoning: false,
      include_confidence: true,
      gpt4_access: false,
      priority_processing: false,
    },
  },
  standard: {
    name: 'Standard',
    rate_limit_per_minute: 30,
    rate_limit_per_day: 1000,
    max_batch_size: 10,
    features: {
      include_reasoning: true,
      include_confidence: true,
      gpt4_access: false,
      priority_processing: false,
    },
  },
  enterprise: {
    name: 'Enterprise',
    rate_limit_per_minute: 100,
    rate_limit_per_day: 10000,
    max_batch_size: 50,
    features: {
      include_reasoning: true,
      include_confidence: true,
      gpt4_access: true,
      priority_processing: true,
    },
  },
};

/**
 * Get tier configuration
 */
export function getTierConfig(tier: ApiKeyTier): TierConfig {
  return TIER_CONFIG[tier];
}

/**
 * Check if a feature is available for a tier
 */
export function hasFeature(
  tier: ApiKeyTier,
  feature: keyof TierConfig['features']
): boolean {
  return TIER_CONFIG[tier].features[feature];
}

/**
 * API endpoint paths
 */
export const API_ENDPOINTS = {
  ANALYZE: '/api/v1/analyze',
  BATCH_ANALYZE: '/api/v1/analyze/batch',
  GET_ANALYSIS: '/api/v1/analysis/:id',
  LIST_ANALYSES: '/api/v1/analyses',
  USAGE: '/api/v1/usage',
} as const;

/**
 * Error codes
 */
export const ERROR_CODES = {
  INVALID_REQUEST: 'invalid_request',
  AUTHENTICATION_REQUIRED: 'authentication_required',
  INVALID_API_KEY: 'invalid_api_key',
  API_KEY_REVOKED: 'api_key_revoked',
  API_KEY_EXPIRED: 'api_key_expired',
  API_KEY_SUSPENDED: 'api_key_suspended',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  FEATURE_NOT_AVAILABLE: 'feature_not_available',
  SERVICE_UNAVAILABLE: 'service_unavailable',
  URL_UNREACHABLE: 'url_unreachable',
  PARSING_FAILED: 'parsing_failed',
  AI_TIMEOUT: 'ai_timeout',
  INTERNAL_ERROR: 'internal_error',
} as const;

/**
 * Cache settings
 */
export const CACHE_CONFIG = {
  // How long to cache analysis results (7 days)
  TTL_SECONDS: 7 * 24 * 60 * 60,
  
  // Maximum content size to analyze (500KB)
  MAX_CONTENT_SIZE_BYTES: 500 * 1024,
  
  // Request timeout (30 seconds)
  REQUEST_TIMEOUT_MS: 30 * 1000,
  
  // Content fetch timeout (10 seconds)
  FETCH_TIMEOUT_MS: 10 * 1000,
} as const;
