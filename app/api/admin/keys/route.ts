/**
 * Admin API endpoints for API key management
 * POST /api/admin/keys - Create new API key
 * GET /api/admin/keys - List all API keys with stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/api/admin-auth';
import { generateApiKey, hashApiKey, getKeyPrefix } from '@/lib/api/crypto';
import { getTierConfig } from '@/lib/api/config';
import { invalidRequestError, handleError } from '@/lib/api/errors';
import { getServiceSupabase } from '@/lib/api/auth';
import { CreateApiKeyRequest, CreateApiKeyResponse, ApiKeyTier } from '@/lib/api/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/keys
 * Create a new API key
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }
    
    const { userId } = authResult;
    
    // Parse request body
    const body = await request.json() as CreateApiKeyRequest;
    
    // Validate required fields
    if (!body.name || !body.contact_email) {
      return invalidRequestError('name and contact_email are required');
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.contact_email)) {
      return invalidRequestError('Invalid email address');
    }
    
    // Validate tier
    const tier = body.tier || 'free';
    if (!['free', 'standard', 'enterprise'].includes(tier)) {
      return invalidRequestError('Invalid tier. Must be: free, standard, or enterprise');
    }
    
    // Get tier configuration
    const tierConfig = getTierConfig(tier as ApiKeyTier);
    
    // Generate API key
    const apiKey = generateApiKey('live');
    const keyHash = hashApiKey(apiKey);
    const keyPrefix = getKeyPrefix(apiKey);
    
    // Create database record
    const supabase = getServiceSupabase();
    
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        key_hash: keyHash,
        key_prefix: keyPrefix,
        name: body.name,
        organization: body.organization || null,
        contact_email: body.contact_email,
        tier,
        status: 'active',
        rate_limit_per_minute: tierConfig.rate_limit_per_minute,
        rate_limit_per_day: tierConfig.rate_limit_per_day,
        max_batch_size: tierConfig.max_batch_size,
        created_by: userId,
        expires_at: body.expires_at || null,
        metadata: body.metadata || {},
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating API key:', error);
      return invalidRequestError('Failed to create API key: ' + error.message);
    }
    
    // Return response with plaintext key (only time it's shown)
    const response: CreateApiKeyResponse = {
      api_key: apiKey, // Only shown once!
      key_prefix: keyPrefix,
      id: data.id,
      name: data.name,
      tier: data.tier,
      rate_limit_per_minute: data.rate_limit_per_minute,
      rate_limit_per_day: data.rate_limit_per_day,
      created_at: data.created_at,
      expires_at: data.expires_at,
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * GET /api/admin/keys
 * List all API keys with usage statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const status = searchParams.get('status');
    const tier = searchParams.get('tier');
    
    const supabase = getServiceSupabase();
    
    // Build query
    let query = supabase
      .from('api_keys_with_stats')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (status && ['active', 'suspended', 'revoked'].includes(status)) {
      query = query.eq('status', status);
    }
    
    if (tier && ['free', 'standard', 'enterprise'].includes(tier)) {
      query = query.eq('tier', tier);
    }
    
    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching API keys:', error);
      return invalidRequestError('Failed to fetch API keys: ' + error.message);
    }
    
    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
