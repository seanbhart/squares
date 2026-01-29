/**
 * Rate limiting utilities
 * 
 * For now, uses in-memory storage. In production, should use Redis (Upstash).
 * To use Redis: npm install @upstash/redis
 */

import { ApiKey } from './types';
import { getTierConfig } from './config';
import { rateLimitError } from './errors';

// In-memory store for rate limiting (replace with Redis in production)
// Structure: Map<keyId, Map<window, count>>
const rateLimitStore = new Map<string, Map<string, { count: number; resetAt: number }>>();

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Get the current time window for a given granularity
 * @param granularity - 'minute' or 'day'
 * @returns Window identifier string
 */
function getTimeWindow(granularity: 'minute' | 'day'): string {
  const now = new Date();
  
  if (granularity === 'minute') {
    // Window: YYYY-MM-DD-HH-MM
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}-${String(now.getUTCHours()).padStart(2, '0')}-${String(now.getUTCMinutes()).padStart(2, '0')}`;
  } else {
    // Window: YYYY-MM-DD
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
  }
}

/**
 * Get reset time for a window
 */
function getResetTime(granularity: 'minute' | 'day'): number {
  const now = new Date();
  
  if (granularity === 'minute') {
    // Reset at next minute
    const resetTime = new Date(now);
    resetTime.setSeconds(60, 0);
    return Math.floor(resetTime.getTime() / 1000);
  } else {
    // Reset at next day
    const resetTime = new Date(now);
    resetTime.setUTCHours(24, 0, 0, 0);
    return Math.floor(resetTime.getTime() / 1000);
  }
}

/**
 * Check and increment rate limit
 */
function checkRateLimit(
  keyId: string,
  granularity: 'minute' | 'day',
  limit: number
): RateLimitResult {
  const window = getTimeWindow(granularity);
  const windowKey = `${keyId}:${granularity}:${window}`;
  
  // Get or create key store
  if (!rateLimitStore.has(keyId)) {
    rateLimitStore.set(keyId, new Map());
  }
  
  const keyStore = rateLimitStore.get(keyId)!;
  const resetAt = getResetTime(granularity);
  const now = Math.floor(Date.now() / 1000);
  
  // Get current count
  let entry = keyStore.get(windowKey);
  
  // Clean up expired entries
  if (entry && entry.resetAt < now) {
    keyStore.delete(windowKey);
    entry = undefined;
  }
  
  if (!entry) {
    entry = { count: 0, resetAt };
    keyStore.set(windowKey, entry);
  }
  
  // Check if limit exceeded
  if (entry.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: entry.resetAt - now,
    };
  }
  
  // Increment counter
  entry.count++;
  
  return {
    allowed: true,
    limit,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Check rate limits for an API key
 * Returns error response if limit exceeded, null if allowed
 */
export async function checkApiKeyRateLimit(
  apiKey: ApiKey
): Promise<Response | null> {
  const config = getTierConfig(apiKey.tier);
  
  // Check per-minute limit
  const minuteResult = checkRateLimit(
    apiKey.id,
    'minute',
    apiKey.rate_limit_per_minute || config.rate_limit_per_minute
  );
  
  if (!minuteResult.allowed) {
    return rateLimitError(minuteResult.retryAfter!);
  }
  
  // Check per-day limit
  const dayResult = checkRateLimit(
    apiKey.id,
    'day',
    apiKey.rate_limit_per_day || config.rate_limit_per_day
  );
  
  if (!dayResult.allowed) {
    return rateLimitError(dayResult.retryAfter!);
  }
  
  // Return null if allowed (not an error)
  return null;
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(apiKey: ApiKey): Record<string, string> {
  const config = getTierConfig(apiKey.tier);
  const window = getTimeWindow('minute');
  const windowKey = `${apiKey.id}:minute:${window}`;
  
  const keyStore = rateLimitStore.get(apiKey.id);
  const entry = keyStore?.get(windowKey);
  
  const limit = apiKey.rate_limit_per_minute || config.rate_limit_per_minute;
  const remaining = entry ? limit - entry.count : limit;
  const resetAt = entry?.resetAt || getResetTime('minute');
  
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': Math.max(0, remaining).toString(),
    'X-RateLimit-Reset': resetAt.toString(),
  };
}

/**
 * Get current usage stats for an API key
 */
export async function getUsageStats(apiKey: ApiKey) {
  const config = getTierConfig(apiKey.tier);
  
  // Get day window stats
  const dayWindow = getTimeWindow('day');
  const dayWindowKey = `${apiKey.id}:day:${dayWindow}`;
  const keyStore = rateLimitStore.get(apiKey.id);
  const dayEntry = keyStore?.get(dayWindowKey);
  
  const dailyLimit = apiKey.rate_limit_per_day || config.rate_limit_per_day;
  const dailyUsed = dayEntry?.count || 0;
  
  return {
    current_period: {
      period: dayWindow,
      requests_count: dailyUsed,
      requests_limit: dailyLimit,
      requests_remaining: Math.max(0, dailyLimit - dailyUsed),
    },
    rate_limits: {
      per_minute: apiKey.rate_limit_per_minute || config.rate_limit_per_minute,
      per_day: dailyLimit,
    },
    last_request_at: apiKey.last_used_at,
  };
}

/**
 * Clean up old rate limit entries (run periodically)
 * In production with Redis, this is handled automatically by TTL
 */
export function cleanupRateLimitStore() {
  const now = Math.floor(Date.now() / 1000);
  
  rateLimitStore.forEach((keyStore, keyId) => {
    keyStore.forEach((entry, windowKey) => {
      if (entry.resetAt < now) {
        keyStore.delete(windowKey);
      }
    });
    
    // Remove empty key stores
    if (keyStore.size === 0) {
      rateLimitStore.delete(keyId);
    }
  });
}

// Clean up every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}

// ============================================================================
// IP-Based Rate Limiting (for public endpoints without API key auth)
// ============================================================================

// In-memory store for IP rate limiting (replace with Redis in production)
// Structure: Map<ip, { count: number; resetAt: number }>
const ipRateLimitStore = new Map<string, { count: number; resetAt: number }>();

interface IpRateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

/**
 * Check and increment rate limit for an IP address
 * @param ip - The IP address to check
 * @param config - Rate limit configuration
 * @returns RateLimitResult with allowed status and metadata
 */
function checkIpRateLimit(ip: string, config: IpRateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowKey = `${ip}:${Math.floor(now / config.windowMs)}`;

  let entry = ipRateLimitStore.get(windowKey);

  // Calculate reset time
  const resetAt = Math.floor((Math.floor(now / config.windowMs) + 1) * config.windowMs / 1000);

  // Clean up expired entry
  if (entry && entry.resetAt < Math.floor(now / 1000)) {
    ipRateLimitStore.delete(windowKey);
    entry = undefined;
  }

  if (!entry) {
    entry = { count: 0, resetAt };
    ipRateLimitStore.set(windowKey, entry);
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    const retryAfter = entry.resetAt - Math.floor(now / 1000);
    return {
      allowed: false,
      limit: config.maxRequests,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: Math.max(1, retryAfter),
    };
  }

  // Increment counter
  entry.count++;

  return {
    allowed: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Check IP-based rate limits for public endpoints
 * Returns error response if limit exceeded, null if allowed
 *
 * @param ip - The client IP address
 * @param maxRequests - Maximum requests allowed in the window (default: 10)
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 */
export function checkIpBasedRateLimit(
  ip: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): Response | null {
  const result = checkIpRateLimit(ip, { maxRequests, windowMs });

  if (!result.allowed) {
    return rateLimitError(result.retryAfter!);
  }

  return null;
}

/**
 * Get rate limit headers for IP-based limiting
 */
export function getIpRateLimitHeaders(
  ip: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): Record<string, string> {
  const now = Date.now();
  const windowKey = `${ip}:${Math.floor(now / windowMs)}`;
  const entry = ipRateLimitStore.get(windowKey);

  const resetAt = entry?.resetAt || Math.floor((Math.floor(now / windowMs) + 1) * windowMs / 1000);
  const remaining = entry ? maxRequests - entry.count : maxRequests;

  return {
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': Math.max(0, remaining).toString(),
    'X-RateLimit-Reset': resetAt.toString(),
  };
}

/**
 * Clean up old IP rate limit entries
 * In production with Redis, this is handled automatically by TTL
 */
export function cleanupIpRateLimitStore() {
  const now = Math.floor(Date.now() / 1000);

  ipRateLimitStore.forEach((entry, key) => {
    if (entry.resetAt < now) {
      ipRateLimitStore.delete(key);
    }
  });
}

// Clean up IP rate limit store every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupIpRateLimitStore, 5 * 60 * 1000);
}
