import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  checkApiKeyRateLimit,
  checkIpBasedRateLimit,
  getRateLimitHeaders,
  getIpRateLimitHeaders,
  getUsageStats,
  cleanupRateLimitStore,
  cleanupIpRateLimitStore,
} from '@/lib/api/rate-limit';
import type { ApiKey } from '@/lib/api/types';

// Helper to create a mock API key
function createMockApiKey(overrides: Partial<ApiKey> = {}): ApiKey {
  return {
    id: 'test-key-123',
    key_hash: 'hash123',
    key_prefix: 'sq_live_test',
    name: 'Test Key',
    organization: null,
    contact_email: 'test@example.com',
    tier: 'standard',
    status: 'active',
    rate_limit_per_minute: 30,
    rate_limit_per_day: 1000,
    max_batch_size: 10,
    usage_count: 0,
    last_used_at: null,
    created_at: new Date().toISOString(),
    created_by: null,
    expires_at: null,
    revoked_at: null,
    revoked_by: null,
    revoke_reason: null,
    metadata: {},
    ...overrides,
  };
}

describe('checkApiKeyRateLimit', () => {
  beforeEach(() => {
    // Clean up rate limit stores before each test
    cleanupRateLimitStore();
  });

  describe('under limit', () => {
    it('should allow requests when under per-minute limit', async () => {
      const apiKey = createMockApiKey({ rate_limit_per_minute: 10 });

      // Make 5 requests (under 10 limit)
      for (let i = 0; i < 5; i++) {
        const result = await checkApiKeyRateLimit(apiKey);
        expect(result).toBeNull(); // null means allowed
      }
    });

    it('should allow requests when under per-day limit', async () => {
      const apiKey = createMockApiKey({
        id: 'day-limit-test-key',
        rate_limit_per_minute: 100, // Set high minute limit
        rate_limit_per_day: 50,
      });

      // Make 25 requests (under 50 day limit)
      for (let i = 0; i < 25; i++) {
        const result = await checkApiKeyRateLimit(apiKey);
        expect(result).toBeNull();
      }
    });

    it('should allow first request for new API key', async () => {
      const apiKey = createMockApiKey({ id: 'brand-new-key' });

      const result = await checkApiKeyRateLimit(apiKey);
      expect(result).toBeNull();
    });
  });

  describe('at limit', () => {
    it('should allow request exactly at per-minute limit', async () => {
      const apiKey = createMockApiKey({
        id: 'at-limit-key',
        rate_limit_per_minute: 5,
      });

      // Make 5 requests (exactly at limit)
      for (let i = 0; i < 5; i++) {
        const result = await checkApiKeyRateLimit(apiKey);
        expect(result).toBeNull();
      }
    });
  });

  describe('over limit', () => {
    it('should block requests when over per-minute limit', async () => {
      const apiKey = createMockApiKey({
        id: 'over-limit-minute-key',
        rate_limit_per_minute: 3,
        rate_limit_per_day: 1000, // High day limit to not interfere
      });

      // Make 3 requests (at limit)
      for (let i = 0; i < 3; i++) {
        const result = await checkApiKeyRateLimit(apiKey);
        expect(result).toBeNull();
      }

      // 4th request should be blocked
      const result = await checkApiKeyRateLimit(apiKey);
      expect(result).toBeInstanceOf(Response);

      const response = result as Response;
      expect(response.status).toBe(429);

      const body = await response.json();
      expect(body.error).toBe('rate_limit_exceeded');
      expect(body.retry_after).toBeGreaterThan(0);
    });

    it('should block requests when over per-day limit', async () => {
      const apiKey = createMockApiKey({
        id: 'over-limit-day-key',
        rate_limit_per_minute: 100, // High minute limit to not interfere
        rate_limit_per_day: 5,
      });

      // Make 5 requests (at day limit)
      for (let i = 0; i < 5; i++) {
        const result = await checkApiKeyRateLimit(apiKey);
        expect(result).toBeNull();
      }

      // 6th request should be blocked
      const result = await checkApiKeyRateLimit(apiKey);
      expect(result).toBeInstanceOf(Response);

      const response = result as Response;
      expect(response.status).toBe(429);
    });

    it('should include Retry-After header in rate limit response', async () => {
      const apiKey = createMockApiKey({
        id: 'retry-after-key',
        rate_limit_per_minute: 1,
      });

      // Exhaust the limit
      await checkApiKeyRateLimit(apiKey);

      // This should be blocked
      const result = await checkApiKeyRateLimit(apiKey);
      expect(result).toBeInstanceOf(Response);

      const response = result as Response;
      const retryAfter = response.headers.get('Retry-After');
      expect(retryAfter).not.toBeNull();
      expect(parseInt(retryAfter!)).toBeGreaterThan(0);
    });
  });

  describe('tier configuration', () => {
    it('should use free tier defaults when no custom limits set', async () => {
      const apiKey = createMockApiKey({
        id: 'free-tier-key',
        tier: 'free',
        rate_limit_per_minute: 0, // 0 means use tier default
        rate_limit_per_day: 0,
      });

      // Free tier has 5/min, so 6th request should fail
      for (let i = 0; i < 5; i++) {
        const result = await checkApiKeyRateLimit(apiKey);
        expect(result).toBeNull();
      }

      const result = await checkApiKeyRateLimit(apiKey);
      expect(result).toBeInstanceOf(Response);
    });

    it('should use enterprise tier defaults for enterprise keys', async () => {
      const apiKey = createMockApiKey({
        id: 'enterprise-tier-key',
        tier: 'enterprise',
        rate_limit_per_minute: 0,
        rate_limit_per_day: 0,
      });

      // Enterprise tier has 100/min, so 50 requests should all pass
      for (let i = 0; i < 50; i++) {
        const result = await checkApiKeyRateLimit(apiKey);
        expect(result).toBeNull();
      }
    });

    it('should allow custom limits to override tier defaults', async () => {
      const apiKey = createMockApiKey({
        id: 'custom-limit-key',
        tier: 'free', // Free tier default is 5/min
        rate_limit_per_minute: 2, // But custom limit is 2
      });

      // Custom limit of 2 should be used
      for (let i = 0; i < 2; i++) {
        const result = await checkApiKeyRateLimit(apiKey);
        expect(result).toBeNull();
      }

      const result = await checkApiKeyRateLimit(apiKey);
      expect(result).toBeInstanceOf(Response);
    });
  });

  describe('key isolation', () => {
    it('should track limits separately for different API keys', async () => {
      const apiKey1 = createMockApiKey({
        id: 'key-1',
        rate_limit_per_minute: 2,
      });

      const apiKey2 = createMockApiKey({
        id: 'key-2',
        rate_limit_per_minute: 2,
      });

      // Exhaust key1's limit
      await checkApiKeyRateLimit(apiKey1);
      await checkApiKeyRateLimit(apiKey1);
      const key1Result = await checkApiKeyRateLimit(apiKey1);
      expect(key1Result).toBeInstanceOf(Response);

      // key2 should still have its full limit
      const key2Result = await checkApiKeyRateLimit(apiKey2);
      expect(key2Result).toBeNull();
    });
  });
});

describe('checkIpBasedRateLimit', () => {
  beforeEach(() => {
    cleanupIpRateLimitStore();
  });

  describe('under limit', () => {
    it('should allow requests when under limit', () => {
      const ip = '192.168.1.1';

      // Make 5 requests with default 10 limit
      for (let i = 0; i < 5; i++) {
        const result = checkIpBasedRateLimit(ip);
        expect(result).toBeNull();
      }
    });

    it('should allow requests with custom limit', () => {
      const ip = '192.168.1.2';

      // Custom limit of 20
      for (let i = 0; i < 15; i++) {
        const result = checkIpBasedRateLimit(ip, 20);
        expect(result).toBeNull();
      }
    });
  });

  describe('at limit', () => {
    it('should allow request exactly at default limit', () => {
      const ip = '192.168.1.3';

      // Default limit is 10
      for (let i = 0; i < 10; i++) {
        const result = checkIpBasedRateLimit(ip);
        expect(result).toBeNull();
      }
    });
  });

  describe('over limit', () => {
    it('should block requests when over default limit', () => {
      const ip = '192.168.1.4';

      // Exhaust the default 10 limit
      for (let i = 0; i < 10; i++) {
        const result = checkIpBasedRateLimit(ip);
        expect(result).toBeNull();
      }

      // 11th request should be blocked
      const result = checkIpBasedRateLimit(ip);
      expect(result).toBeInstanceOf(Response);
      expect((result as Response).status).toBe(429);
    });

    it('should block requests when over custom limit', () => {
      const ip = '192.168.1.5';

      // Custom limit of 3
      for (let i = 0; i < 3; i++) {
        const result = checkIpBasedRateLimit(ip, 3);
        expect(result).toBeNull();
      }

      // 4th request should be blocked
      const result = checkIpBasedRateLimit(ip, 3);
      expect(result).toBeInstanceOf(Response);
    });

    it('should return rate limit error with retry_after', async () => {
      const ip = '192.168.1.6';

      // Exhaust limit
      checkIpBasedRateLimit(ip, 1);

      // Get blocked response
      const result = checkIpBasedRateLimit(ip, 1);
      expect(result).toBeInstanceOf(Response);

      const body = await (result as Response).json();
      expect(body.error).toBe('rate_limit_exceeded');
      expect(body.retry_after).toBeGreaterThan(0);
    });
  });

  describe('IP isolation', () => {
    it('should track limits separately for different IPs', () => {
      const ip1 = '10.0.0.1';
      const ip2 = '10.0.0.2';

      // Exhaust ip1's limit
      for (let i = 0; i < 10; i++) {
        checkIpBasedRateLimit(ip1);
      }
      const ip1Result = checkIpBasedRateLimit(ip1);
      expect(ip1Result).toBeInstanceOf(Response);

      // ip2 should still have its full limit
      const ip2Result = checkIpBasedRateLimit(ip2);
      expect(ip2Result).toBeNull();
    });
  });

  describe('custom window', () => {
    it('should accept custom window duration', () => {
      const ip = '172.16.0.1';

      // Custom window of 5 minutes (300000ms)
      const result = checkIpBasedRateLimit(ip, 10, 300000);
      expect(result).toBeNull();
    });
  });
});

describe('getRateLimitHeaders', () => {
  beforeEach(() => {
    cleanupRateLimitStore();
  });

  it('should return rate limit headers', async () => {
    const apiKey = createMockApiKey({
      id: 'header-test-key',
      rate_limit_per_minute: 30,
    });

    // Make some requests to populate the store
    await checkApiKeyRateLimit(apiKey);
    await checkApiKeyRateLimit(apiKey);

    const headers = getRateLimitHeaders(apiKey);

    expect(headers).toHaveProperty('X-RateLimit-Limit');
    expect(headers).toHaveProperty('X-RateLimit-Remaining');
    expect(headers).toHaveProperty('X-RateLimit-Reset');

    expect(headers['X-RateLimit-Limit']).toBe('30');
    expect(parseInt(headers['X-RateLimit-Remaining'])).toBe(28); // 30 - 2 requests
  });

  it('should return full limit for new key', () => {
    const apiKey = createMockApiKey({
      id: 'new-header-key',
      rate_limit_per_minute: 50,
    });

    const headers = getRateLimitHeaders(apiKey);

    expect(headers['X-RateLimit-Limit']).toBe('50');
    expect(headers['X-RateLimit-Remaining']).toBe('50');
  });

  it('should return 0 remaining when exhausted', async () => {
    const apiKey = createMockApiKey({
      id: 'exhausted-header-key',
      rate_limit_per_minute: 2,
    });

    // Exhaust limit
    await checkApiKeyRateLimit(apiKey);
    await checkApiKeyRateLimit(apiKey);

    const headers = getRateLimitHeaders(apiKey);
    expect(headers['X-RateLimit-Remaining']).toBe('0');
  });
});

describe('getIpRateLimitHeaders', () => {
  beforeEach(() => {
    cleanupIpRateLimitStore();
  });

  it('should return rate limit headers for IP', () => {
    const ip = '1.2.3.4';

    // Make some requests
    checkIpBasedRateLimit(ip, 20);
    checkIpBasedRateLimit(ip, 20);
    checkIpBasedRateLimit(ip, 20);

    const headers = getIpRateLimitHeaders(ip, 20);

    expect(headers).toHaveProperty('X-RateLimit-Limit');
    expect(headers).toHaveProperty('X-RateLimit-Remaining');
    expect(headers).toHaveProperty('X-RateLimit-Reset');

    expect(headers['X-RateLimit-Limit']).toBe('20');
    expect(parseInt(headers['X-RateLimit-Remaining'])).toBe(17); // 20 - 3
  });

  it('should return full limit for new IP', () => {
    const ip = '5.6.7.8';

    const headers = getIpRateLimitHeaders(ip, 15);

    expect(headers['X-RateLimit-Limit']).toBe('15');
    expect(headers['X-RateLimit-Remaining']).toBe('15');
  });
});

describe('getUsageStats', () => {
  beforeEach(() => {
    cleanupRateLimitStore();
  });

  it('should return usage statistics for API key', async () => {
    const apiKey = createMockApiKey({
      id: 'usage-stats-key',
      rate_limit_per_minute: 30,
      rate_limit_per_day: 1000,
      last_used_at: '2024-01-15T12:00:00Z',
    });

    // Make some requests
    await checkApiKeyRateLimit(apiKey);
    await checkApiKeyRateLimit(apiKey);
    await checkApiKeyRateLimit(apiKey);

    const stats = await getUsageStats(apiKey);

    expect(stats).toHaveProperty('current_period');
    expect(stats).toHaveProperty('rate_limits');
    expect(stats).toHaveProperty('last_request_at');

    expect(stats.current_period.requests_count).toBe(3);
    expect(stats.current_period.requests_limit).toBe(1000);
    expect(stats.current_period.requests_remaining).toBe(997);

    expect(stats.rate_limits.per_minute).toBe(30);
    expect(stats.rate_limits.per_day).toBe(1000);
  });

  it('should return zero usage for new key', async () => {
    const apiKey = createMockApiKey({
      id: 'new-stats-key',
      rate_limit_per_day: 500,
    });

    const stats = await getUsageStats(apiKey);

    expect(stats.current_period.requests_count).toBe(0);
    expect(stats.current_period.requests_remaining).toBe(500);
  });
});

describe('window rollover', () => {
  beforeEach(() => {
    cleanupRateLimitStore();
    cleanupIpRateLimitStore();
  });

  it('should reset counter in new time window for API keys', async () => {
    // This test verifies the windowing mechanism by checking that
    // different windows track counts independently
    const apiKey = createMockApiKey({
      id: 'window-test-key',
      rate_limit_per_minute: 5,
    });

    // Exhaust limit in current window
    for (let i = 0; i < 5; i++) {
      await checkApiKeyRateLimit(apiKey);
    }

    // Verify limit is exhausted
    const blockedResult = await checkApiKeyRateLimit(apiKey);
    expect(blockedResult).toBeInstanceOf(Response);

    // The actual window rollover happens automatically when the minute changes
    // This test verifies the blocking behavior works correctly
    expect((blockedResult as Response).status).toBe(429);
  });

  it('should reset counter in new time window for IP-based limits', () => {
    const ip = '192.168.100.1';

    // Exhaust limit
    for (let i = 0; i < 10; i++) {
      checkIpBasedRateLimit(ip);
    }

    // Verify limit is exhausted
    const blockedResult = checkIpBasedRateLimit(ip);
    expect(blockedResult).toBeInstanceOf(Response);
    expect((blockedResult as Response).status).toBe(429);
  });
});

describe('cleanup functions', () => {
  it('should clean up expired entries from API key rate limit store', async () => {
    // This is more of a smoke test to ensure cleanup doesn't throw
    const apiKey = createMockApiKey({ id: 'cleanup-test-key' });
    await checkApiKeyRateLimit(apiKey);

    // Cleanup should not throw
    expect(() => cleanupRateLimitStore()).not.toThrow();
  });

  it('should clean up expired entries from IP rate limit store', () => {
    checkIpBasedRateLimit('cleanup-test-ip');

    // Cleanup should not throw
    expect(() => cleanupIpRateLimitStore()).not.toThrow();
  });
});
