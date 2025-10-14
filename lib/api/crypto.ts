/**
 * Cryptographic utilities for API key management
 */

import { createHash, randomBytes } from 'crypto';

/**
 * Generate a secure random API key
 * @param env - 'live' or 'test'
 * @returns API key in format: sq_{env}_{32-char-random}
 */
export function generateApiKey(env: 'live' | 'test' = 'live'): string {
  // Generate 24 random bytes (will be 32 chars in base64url)
  const randomPart = randomBytes(24)
    .toString('base64url')
    .replace(/=/g, ''); // Remove padding
  
  return `sq_${env}_${randomPart}`;
}

/**
 * Hash an API key for secure storage
 * Uses SHA-256 to create a one-way hash
 * @param apiKey - The plaintext API key
 * @returns Hashed key (hex string)
 */
export function hashApiKey(apiKey: string): string {
  return createHash('sha256')
    .update(apiKey)
    .digest('hex');
}

/**
 * Extract the prefix from an API key (first 12 characters)
 * Used for identification without storing the full key
 * @param apiKey - The plaintext API key
 * @returns Key prefix (e.g., "sq_live_abc1")
 */
export function getKeyPrefix(apiKey: string): string {
  return apiKey.substring(0, 12);
}

/**
 * Validate API key format
 * @param apiKey - The API key to validate
 * @returns True if valid format
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  // Must start with sq_live_ or sq_test_ followed by 32 chars
  const pattern = /^sq_(live|test)_[A-Za-z0-9_-]{32}$/;
  return pattern.test(apiKey);
}

/**
 * Check if an API key is a test key
 * @param apiKey - The API key to check
 * @returns True if test key
 */
export function isTestKey(apiKey: string): boolean {
  return apiKey.startsWith('sq_test_');
}

/**
 * Generate a hash for URL caching
 * @param url - The URL to hash
 * @returns SHA-256 hash of normalized URL
 */
export function hashUrl(url: string): string {
  // Normalize URL (remove trailing slash, convert to lowercase)
  const normalized = url.toLowerCase().replace(/\/$/, '');
  
  return createHash('sha256')
    .update(normalized)
    .digest('hex');
}
