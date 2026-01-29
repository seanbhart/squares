/**
 * API authentication middleware
 */

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hashApiKey, isValidApiKeyFormat } from './crypto';
import { ApiKey } from './types';
import {
  authenticationRequiredError,
  invalidApiKeyError,
  apiKeyRevokedError,
  apiKeyExpiredError,
  apiKeySuspendedError,
} from './errors';

/**
 * Extract API key from Authorization header
 * Supports: "Bearer <key>" or just "<key>"
 */
export function extractApiKey(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return null;
  }
  
  // Handle "Bearer <key>" format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  
  // Handle raw key
  return authHeader.trim();
}

/**
 * Validate and authenticate an API key
 * Returns the ApiKey record if valid, or throws an error
 */
export async function validateApiKey(
  request: NextRequest
): Promise<{ key: ApiKey; plainKey: string } | Response> {
  // Extract API key from header
  const apiKey = extractApiKey(request);
  
  if (!apiKey) {
    return authenticationRequiredError('API key is required in Authorization header');
  }
  
  // Validate format
  if (!isValidApiKeyFormat(apiKey)) {
    return invalidApiKeyError();
  }
  
  // Hash the key for lookup
  const keyHash = hashApiKey(apiKey);
  
  // Create Supabase client with service role (bypasses RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
  
  // Look up the key in database
  const { data: keyData, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key_hash', keyHash)
    .single();
  
  if (error || !keyData) {
    return invalidApiKeyError();
  }
  
  const key = keyData as unknown as ApiKey;
  
  // Check if key is revoked
  if (key.status === 'revoked') {
    return apiKeyRevokedError(key.revoke_reason || undefined);
  }
  
  // Check if key is suspended
  if (key.status === 'suspended') {
    return apiKeySuspendedError();
  }
  
  // Check if key is expired
  if (key.expires_at) {
    const expiresAt = new Date(key.expires_at);
    if (expiresAt < new Date()) {
      return apiKeyExpiredError();
    }
  }
  
  // Update last_used_at (fire and forget, don't wait)
  // We still log errors to help debug issues without blocking the request
  supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', key.id)
    .then(({ error }) => {
      if (error) {
        console.error('Failed to update last_used_at for API key:', key.id, error.message);
      }
    });
  
  return { key, plainKey: apiKey };
}

/**
 * Create Supabase client with service role for API operations
 */
export function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
