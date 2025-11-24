/**
 * Internal CORE Data API Endpoint
 * Used by the DataViewer component (no API key required)
 * Returns public CORE spectrums from the public_core_spectrums view
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 1000);
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

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
    console.error('Unexpected error in CORE data endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

