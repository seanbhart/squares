import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { validateApiKey } from '@/lib/api/auth';
import { checkApiKeyRateLimit, getRateLimitHeaders } from '@/lib/api/rate-limit';
import { getServiceSupabase } from '@/lib/api/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/data/spectrums
 * 
 * Returns user spectrums that have been marked as public.
 * Requires API key authentication. Used for data analysis, research, and visualization.
 * 
 * Authentication:
 * - Header: Authorization: Bearer <your-api-key>
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 100, max: 1000)
 * - sort: Sort field (created_at, updated_at, divergence_score, spread_score, times_updated)
 * - order: Sort order (asc, desc, default: desc)
 * - min_divergence: Minimum divergence score filter
 * - max_divergence: Maximum divergence score filter
 * - min_spread: Minimum spread score filter
 * - max_spread: Maximum spread score filter
 * 
 * Legacy parameters (for backward compatibility):
 * - min_extremity, max_extremity (alias for min_divergence, max_divergence)
 * - min_diversity, max_diversity (alias for min_divergence, max_divergence)
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Authenticate API key
    const authResult = await validateApiKey(request);
    if (authResult instanceof Response) {
      return authResult;
    }
    
    const { key: apiKey } = authResult;
    
    // Check rate limits
    const rateLimitError = await checkApiKeyRateLimit(apiKey);
    if (rateLimitError) {
      return rateLimitError;
    }
    
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(1000, Math.max(1, parseInt(searchParams.get('limit') || '100')));
    const offset = (page - 1) * limit;
    
    // Sorting
    const sortField = searchParams.get('sort') || 'created_at';
    const sortOrder = searchParams.get('order') || 'desc';
    
    const validSortFields = ['created_at', 'updated_at', 'divergence_score', 'spread_score', 'times_updated'];
    const validOrders = ['asc', 'desc'];
    
    if (!validSortFields.includes(sortField) || !validOrders.includes(sortOrder)) {
      return NextResponse.json(
        { error: 'invalid_parameters', message: 'Invalid sort field or order' },
        { status: 400 }
      );
    }
    
    // Filters - support new divergence parameters and legacy extremity/diversity parameters
    const minDivergence = searchParams.get('min_divergence') 
      || searchParams.get('min_extremity') 
      || searchParams.get('min_diversity');
    const maxDivergence = searchParams.get('max_divergence')
      || searchParams.get('max_extremity')
      || searchParams.get('max_diversity');
    const minSpread = searchParams.get('min_spread');
    const maxSpread = searchParams.get('max_spread');
    
    const minDivergenceValue = minDivergence ? parseFloat(minDivergence) : null;
    const maxDivergenceValue = maxDivergence ? parseFloat(maxDivergence) : null;
    const minSpreadValue = minSpread ? parseFloat(minSpread) : null;
    const maxSpreadValue = maxSpread ? parseFloat(maxSpread) : null;
    
    // Use service role client for API requests
    const supabase = getServiceSupabase();
    
    // WORKAROUND: Get total count separately to avoid Supabase count bug with views
    // When using range() with count on views, Supabase sometimes returns incorrect counts
    let countQuery = supabase
      .from('public_farcaster_spectrums')
      .select('*', { count: 'exact', head: true });
    
    // Apply same filters to count query
    if (minDivergenceValue !== null) {
      countQuery = countQuery.gte('divergence_score', minDivergenceValue);
    }
    if (maxDivergenceValue !== null) {
      countQuery = countQuery.lte('divergence_score', maxDivergenceValue);
    }
    if (minSpreadValue !== null) {
      countQuery = countQuery.gte('spread_score', minSpreadValue);
    }
    if (maxSpreadValue !== null) {
      countQuery = countQuery.lte('spread_score', maxSpreadValue);
    }
    
    const { count, error: countError } = await countQuery;
    
    if (countError) {
      console.error('Error getting count:', countError);
    }
    
    // Build data query separately (without count)
    let dataQuery = supabase
      .from('public_farcaster_spectrums')
      .select('*');
    
    // Apply same filters to data query
    if (minDivergenceValue !== null) {
      dataQuery = dataQuery.gte('divergence_score', minDivergenceValue);
    }
    if (maxDivergenceValue !== null) {
      dataQuery = dataQuery.lte('divergence_score', maxDivergenceValue);
    }
    if (minSpreadValue !== null) {
      dataQuery = dataQuery.gte('spread_score', minSpreadValue);
    }
    if (maxSpreadValue !== null) {
      dataQuery = dataQuery.lte('spread_score', maxSpreadValue);
    }
    
    // Apply sorting and pagination to data query
    dataQuery = dataQuery
      .order(sortField as any, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);
    
    const { data, error } = await dataQuery;
    
    if (error) {
      console.error('Error fetching public spectrums:', error);
      
      // Log error for monitoring
      await logApiRequest({
        api_key_id: apiKey.id,
        endpoint: '/api/v1/data/spectrums',
        method: 'GET',
        status_code: 500,
        response_time_ms: Date.now() - startTime,
        error_message: error.message,
        query_params: Object.fromEntries(searchParams),
      });
      
      return NextResponse.json(
        { error: 'database_error', message: 'Failed to fetch data' },
        { status: 500 }
      );
    }
    
    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / limit);
    
    // Log successful request
    await logApiRequest({
      api_key_id: apiKey.id,
      endpoint: '/api/v1/data/spectrums',
      method: 'GET',
      status_code: 200,
      response_time_ms: Date.now() - startTime,
      result_count: data?.length || 0,
      query_params: Object.fromEntries(searchParams),
    });
    
    // Get rate limit headers
    const rateLimitHeaders = getRateLimitHeaders(apiKey);
    
    return NextResponse.json(
      {
        data: data || [],
        pagination: {
          page,
          limit,
          total_results: count || 0,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
        meta: {
          query_timestamp: new Date().toISOString(),
          data_type: 'public_user_spectrums',
          note: 'Only includes users who have opted to share their data publicly',
        },
      },
      {
        headers: rateLimitHeaders,
      }
    );
  } catch (error) {
    console.error('Unexpected error in data API:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * Log API request for monitoring and analytics
 */
async function logApiRequest(logData: {
  api_key_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  result_count?: number;
  error_message?: string;
  query_params?: Record<string, string>;
}) {
  try {
    const supabase = getServiceSupabase();
    
    await supabase.from('api_usage_logs').insert({
      api_key_id: logData.api_key_id,
      endpoint: logData.endpoint,
      method: logData.method,
      status_code: logData.status_code,
      response_time_ms: logData.response_time_ms,
      result_count: logData.result_count,
      error_message: logData.error_message,
      metadata: logData.query_params || {},
    });
  } catch (error) {
    // Don't fail the request if logging fails
    console.error('Failed to log API request:', error);
  }
}
