import { describe, it, expect } from 'vitest';
import {
  generateApiKey,
  hashApiKey,
  isValidApiKeyFormat,
  isTestKey,
  getKeyPrefix,
  hashUrl,
} from '@/lib/api/crypto';

describe('generateApiKey', () => {
  describe('key format', () => {
    it('should return a string with correct prefix format for live keys', () => {
      const key = generateApiKey('live');
      expect(key).toMatch(/^sq_live_[A-Za-z0-9_-]{32}$/);
    });

    it('should return a string with correct prefix format for test keys', () => {
      const key = generateApiKey('test');
      expect(key).toMatch(/^sq_test_[A-Za-z0-9_-]{32}$/);
    });

    it('should default to live environment when no argument provided', () => {
      const key = generateApiKey();
      expect(key).toMatch(/^sq_live_/);
    });

    it('should generate keys of consistent length', () => {
      const key1 = generateApiKey('live');
      const key2 = generateApiKey('test');

      // sq_live_ = 8 chars, sq_test_ = 8 chars, random = 32 chars
      expect(key1.length).toBe(8 + 32); // sq_live_ + 32 chars
      expect(key2.length).toBe(8 + 32); // sq_test_ + 32 chars
    });
  });

  describe('key uniqueness', () => {
    it('should generate unique keys on each call', () => {
      const keys = new Set<string>();
      for (let i = 0; i < 100; i++) {
        keys.add(generateApiKey('live'));
      }
      expect(keys.size).toBe(100);
    });

    it('should generate cryptographically random keys', () => {
      const key1 = generateApiKey('live');
      const key2 = generateApiKey('live');

      // Keys should never be the same
      expect(key1).not.toBe(key2);

      // The random portions should be different
      const random1 = key1.substring(8);
      const random2 = key2.substring(8);
      expect(random1).not.toBe(random2);
    });
  });

  describe('key validation', () => {
    it('should generate keys that pass format validation', () => {
      const liveKey = generateApiKey('live');
      const testKey = generateApiKey('test');

      expect(isValidApiKeyFormat(liveKey)).toBe(true);
      expect(isValidApiKeyFormat(testKey)).toBe(true);
    });
  });
});

describe('hashApiKey', () => {
  describe('determinism', () => {
    it('should produce the same hash for the same input', () => {
      const apiKey = 'sq_live_abcdefghijklmnopqrstuvwxyz123456';
      const hash1 = hashApiKey(apiKey);
      const hash2 = hashApiKey(apiKey);

      expect(hash1).toBe(hash2);
    });

    it('should be deterministic across multiple calls', () => {
      const apiKey = 'sq_test_abcdefghijklmnopqrstuvwxyz123456';
      const hashes = new Set<string>();

      for (let i = 0; i < 10; i++) {
        hashes.add(hashApiKey(apiKey));
      }

      expect(hashes.size).toBe(1);
    });
  });

  describe('uniqueness', () => {
    it('should produce different hashes for different inputs', () => {
      const key1 = 'sq_live_abcdefghijklmnopqrstuvwxyz123456';
      const key2 = 'sq_live_abcdefghijklmnopqrstuvwxyz123457';

      const hash1 = hashApiKey(key1);
      const hash2 = hashApiKey(key2);

      expect(hash1).not.toBe(hash2);
    });

    it('should produce unique hashes for similar keys with only prefix difference', () => {
      const liveKey = 'sq_live_abcdefghijklmnopqrstuvwxyz123456';
      const testKey = 'sq_test_abcdefghijklmnopqrstuvwxyz123456';

      const hash1 = hashApiKey(liveKey);
      const hash2 = hashApiKey(testKey);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('hash format', () => {
    it('should produce a 64-character hex string (SHA-256)', () => {
      const apiKey = 'sq_live_abcdefghijklmnopqrstuvwxyz123456';
      const hash = hashApiKey(apiKey);

      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should produce lowercase hex output', () => {
      const apiKey = 'sq_live_ABCDEFGHIJKLMNOPQRSTUVWXYZ123456';
      const hash = hashApiKey(apiKey);

      expect(hash).toBe(hash.toLowerCase());
    });
  });

  describe('one-way property', () => {
    it('should not be reversible (different keys produce different hashes)', () => {
      // Generate 100 unique keys and verify all hashes are unique
      const hashes = new Set<string>();

      for (let i = 0; i < 100; i++) {
        const key = generateApiKey('live');
        hashes.add(hashApiKey(key));
      }

      expect(hashes.size).toBe(100);
    });
  });
});

describe('isValidApiKeyFormat', () => {
  describe('valid formats', () => {
    it('should accept valid live key format', () => {
      const validKey = 'sq_live_abcdefghijklmnopqrstuvwxyz123456';
      expect(isValidApiKeyFormat(validKey)).toBe(true);
    });

    it('should accept valid test key format', () => {
      const validKey = 'sq_test_abcdefghijklmnopqrstuvwxyz123456';
      expect(isValidApiKeyFormat(validKey)).toBe(true);
    });

    it('should accept keys with uppercase letters', () => {
      const validKey = 'sq_live_ABCDEFGHIJKLMNOPQRSTUVWXYZ123456';
      expect(isValidApiKeyFormat(validKey)).toBe(true);
    });

    it('should accept keys with mixed case', () => {
      const validKey = 'sq_live_AbCdEfGhIjKlMnOpQrStUvWxYz123456';
      expect(isValidApiKeyFormat(validKey)).toBe(true);
    });

    it('should accept keys with underscores in random part', () => {
      // The regex allows underscores in the 32-char random part
      // sq_live_ (8 chars) + 32 chars = 40 total
      // Random part: abcdefghijklmnopqrstuvwx_z123456 (32 chars)
      const validKey = 'sq_live_abcdefghijklmnopqrstuvwx_z123456';
      expect(validKey.length).toBe(40); // Verify correct length
      expect(isValidApiKeyFormat(validKey)).toBe(true);
    });

    it('should accept keys with hyphens in random part', () => {
      // The regex allows hyphens in the 32-char random part
      // sq_live_ (8 chars) + 32 chars = 40 total
      // Random part: abcdefghijklmnopqrstuvwx-z123456 (32 chars)
      const validKey = 'sq_live_abcdefghijklmnopqrstuvwx-z123456';
      expect(validKey.length).toBe(40); // Verify correct length
      expect(isValidApiKeyFormat(validKey)).toBe(true);
    });

    it('should accept generated keys', () => {
      const generatedLive = generateApiKey('live');
      const generatedTest = generateApiKey('test');

      expect(isValidApiKeyFormat(generatedLive)).toBe(true);
      expect(isValidApiKeyFormat(generatedTest)).toBe(true);
    });
  });

  describe('invalid formats', () => {
    it('should reject empty string', () => {
      expect(isValidApiKeyFormat('')).toBe(false);
    });

    it('should reject null-like values', () => {
      expect(isValidApiKeyFormat('null')).toBe(false);
      expect(isValidApiKeyFormat('undefined')).toBe(false);
    });

    it('should reject wrong prefix', () => {
      expect(isValidApiKeyFormat('xx_fake_abcdefghijklmnopqrstuvwxyz123456')).toBe(false);
      expect(isValidApiKeyFormat('api_live_abcdefghijklmnopqrstuvwxyz123456')).toBe(false);
      expect(isValidApiKeyFormat('xx_live_abcdefghijklmnopqrstuvwxyz123456')).toBe(false);
    });

    it('should reject wrong environment in prefix', () => {
      expect(isValidApiKeyFormat('sq_prod_abcdefghijklmnopqrstuvwxyz123456')).toBe(false);
      expect(isValidApiKeyFormat('sq_dev_abcdefghijklmnopqrstuvwxyz123456')).toBe(false);
      expect(isValidApiKeyFormat('sq_staging_abcdefghijklmnopqrstuvwxyz12')).toBe(false);
    });

    it('should reject keys with incorrect random part length (too short)', () => {
      expect(isValidApiKeyFormat('sq_live_abc')).toBe(false);
      expect(isValidApiKeyFormat('sq_live_abcdefghijklmnopqrstuvwxyz1234')).toBe(false); // 31 chars
    });

    it('should reject keys with incorrect random part length (too long)', () => {
      expect(isValidApiKeyFormat('sq_live_abcdefghijklmnopqrstuvwxyz1234567')).toBe(false); // 33 chars
    });

    it('should reject keys with special characters (except underscore and hyphen)', () => {
      expect(isValidApiKeyFormat('sq_live_abc!efghijklmnopqrstuvwxyz12345')).toBe(false);
      expect(isValidApiKeyFormat('sq_live_abc@efghijklmnopqrstuvwxyz12345')).toBe(false);
      expect(isValidApiKeyFormat('sq_live_abc#efghijklmnopqrstuvwxyz12345')).toBe(false);
      expect(isValidApiKeyFormat('sq_live_abc$efghijklmnopqrstuvwxyz12345')).toBe(false);
      expect(isValidApiKeyFormat('sq_live_abc%efghijklmnopqrstuvwxyz12345')).toBe(false);
      expect(isValidApiKeyFormat('sq_live_abc efghijklmnopqrstuvwxyz12345')).toBe(false); // space
    });

    it('should reject keys without proper structure', () => {
      expect(isValidApiKeyFormat('sqlive_abcdefghijklmnopqrstuvwxyz123456')).toBe(false);
      expect(isValidApiKeyFormat('sq_liveabcdefghijklmnopqrstuvwxyz123456')).toBe(false);
      expect(isValidApiKeyFormat('sqlivea bcdefghijklmnopqrstuvwxyz123456')).toBe(false);
    });

    it('should reject keys with only whitespace', () => {
      expect(isValidApiKeyFormat('   ')).toBe(false);
      expect(isValidApiKeyFormat('\t\n')).toBe(false);
    });
  });
});

describe('isTestKey', () => {
  describe('test key identification', () => {
    it('should return true for test keys', () => {
      expect(isTestKey('sq_test_abcdefghijklmnopqrstuvwxyz123456')).toBe(true);
    });

    it('should return true for generated test keys', () => {
      const testKey = generateApiKey('test');
      expect(isTestKey(testKey)).toBe(true);
    });
  });

  describe('live key identification', () => {
    it('should return false for live keys', () => {
      expect(isTestKey('sq_live_abcdefghijklmnopqrstuvwxyz123456')).toBe(false);
    });

    it('should return false for generated live keys', () => {
      const liveKey = generateApiKey('live');
      expect(isTestKey(liveKey)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should return false for empty string', () => {
      expect(isTestKey('')).toBe(false);
    });

    it('should return false for keys with wrong prefix', () => {
      expect(isTestKey('sk_test_abcdefghijklmnopqrstuvwxyz123456')).toBe(false);
    });

    it('should be case-sensitive', () => {
      expect(isTestKey('sq_TEST_abcdefghijklmnopqrstuvwxyz123456')).toBe(false);
      expect(isTestKey('SQ_test_abcdefghijklmnopqrstuvwxyz123456')).toBe(false);
    });
  });
});

describe('getKeyPrefix', () => {
  describe('prefix extraction', () => {
    it('should extract first 12 characters of a key', () => {
      const key = 'sq_live_abcdefghijklmnopqrstuvwxyz123456';
      const prefix = getKeyPrefix(key);

      expect(prefix).toBe('sq_live_abcd');
      expect(prefix.length).toBe(12);
    });

    it('should extract prefix from test keys', () => {
      const key = 'sq_test_xyz123456789012345678901234567';
      const prefix = getKeyPrefix(key);

      expect(prefix).toBe('sq_test_xyz1');
    });

    it('should handle keys shorter than 12 characters', () => {
      const shortKey = 'sq_live';
      const prefix = getKeyPrefix(shortKey);

      expect(prefix).toBe('sq_live');
      expect(prefix.length).toBe(7);
    });
  });

  describe('prefix consistency', () => {
    it('should extract consistent prefix for generated keys', () => {
      const key = generateApiKey('live');
      const prefix = getKeyPrefix(key);

      expect(prefix.startsWith('sq_live_')).toBe(true);
      expect(prefix.length).toBe(12);
    });
  });
});

describe('hashUrl', () => {
  describe('URL normalization', () => {
    it('should produce same hash for URLs with different cases', () => {
      const hash1 = hashUrl('https://EXAMPLE.com/PATH');
      const hash2 = hashUrl('https://example.com/path');

      expect(hash1).toBe(hash2);
    });

    it('should produce same hash for URLs with/without trailing slash', () => {
      const hash1 = hashUrl('https://example.com/path/');
      const hash2 = hashUrl('https://example.com/path');

      expect(hash1).toBe(hash2);
    });
  });

  describe('hash format', () => {
    it('should produce a 64-character hex string (SHA-256)', () => {
      const hash = hashUrl('https://example.com');

      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('uniqueness', () => {
    it('should produce different hashes for different URLs', () => {
      const hash1 = hashUrl('https://example.com/page1');
      const hash2 = hashUrl('https://example.com/page2');

      expect(hash1).not.toBe(hash2);
    });
  });
});
