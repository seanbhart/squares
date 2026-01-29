/**
 * Public CORE Data API Endpoint
 * Returns public CORE spectrums (requires API key for external use)
 * 
 * GET /api/v1/data/core-spectrums
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 100, max: 1000)
 * - sort: Sort field (default: created_at)
 * - order: Sort order 'asc' or 'desc' (default: desc)
 * 
 * Headers:
 * - Authorization: Bearer <your-api-key> (required)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateApiKey } from '@/lib/api/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Valid sort fields to prevent SQL injection
const validSortFields = ['created_at', 'updated_at', 'diversity_score', 'times_updated'];

export async function GET(request: NextRequest) {
  try {
    // Validate API key
    const authResult = await validateApiKey(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 1000);
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

    // Validate sort field to prevent SQL injection
    if (!validSortFields.includes(sort)) {
      return NextResponse.json({ error: 'Invalid sort field' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Count total results
    const { count, error: countError } = await supabase
      .from('public_core_spectrums')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting records:', countError);
      return NextResponse.json({ error: 'Failed to count records' }, { status: 500 });
    }

    // Fetch paginated data
    const offset = (page - 1) * limit;
    const { data, error } = await supabase
      .from('public_core_spectrums')
      .select('*')
      .order(sort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching data:', error);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    const totalResults = count || 0;
    const totalPages = Math.ceil(totalResults / limit);

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total_results: totalResults,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    });
  } catch (error) {
    console.error('Unexpected error in CORE data API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

