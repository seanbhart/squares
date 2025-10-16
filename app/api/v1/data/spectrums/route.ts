import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { validateApiKey } from '@/lib/api/auth';
import { checkApiKeyRateLimit, getRateLimitHeaders } from '@/lib/api/rate-limit';
import { getServiceSupabase } from '@/lib/api/auth';

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
 * - sort: Sort field (created_at, updated_at, extremity_score, spread_score, times_updated)
 * - order: Sort order (asc, desc, default: desc)
 * - min_extremity: Minimum extremity score filter
 * - max_extremity: Maximum extremity score filter
 * - min_spread: Minimum spread score filter
 * - max_spread: Maximum spread score filter
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
    
    const validSortFields = ['created_at', 'updated_at', 'diversity_score', 'extremity_score', 'spread_score', 'times_updated'];
    const validOrders = ['asc', 'desc'];
    
    if (!validSortFields.includes(sortField) || !validOrders.includes(sortOrder)) {
      return NextResponse.json(
        { error: 'invalid_parameters', message: 'Invalid sort field or order' },
        { status: 400 }
      );
    }
    
    // Filters
    const minExtremity = searchParams.get('min_extremity') ? parseFloat(searchParams.get('min_extremity')!) : null;
    const maxExtremity = searchParams.get('max_extremity') ? parseFloat(searchParams.get('max_extremity')!) : null;
    const minSpread = searchParams.get('min_spread') ? parseFloat(searchParams.get('min_spread')!) : null;
    const maxSpread = searchParams.get('max_spread') ? parseFloat(searchParams.get('max_spread')!) : null;
    
    // Use service role client for API requests
    const supabase = getServiceSupabase();
    
    // Build query
    let query = supabase
      .from('public_farcaster_spectrums')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (minExtremity !== null) {
      query = query.gte('extremity_score', minExtremity);
    }
    if (maxExtremity !== null) {
      query = query.lte('extremity_score', maxExtremity);
    }
    if (minSpread !== null) {
      query = query.gte('spread_score', minSpread);
    }
    if (maxSpread !== null) {
      query = query.lte('spread_score', maxSpread);
    }
    
    // Apply sorting and pagination
    query = query
      .order(sortField as any, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
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
