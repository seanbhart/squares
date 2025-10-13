import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sortBy = searchParams.get('sortBy') || 'recent';
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = await supabaseServer();

    let query = supabase
      .from('farcaster_leaderboard')
      .select('*')
      .eq('is_public', true)
      .limit(limit);

    // Apply sorting
    switch (sortBy) {
      case 'diversity':
        query = query.order('diversity_score', { ascending: false });
        break;
      case 'updates':
        query = query.order('times_updated', { ascending: false });
        break;
      case 'recent':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data, error } = await query;

    if (error) {
      // If table doesn't exist yet, return empty data
      if (error.code === '42P01') {
        return NextResponse.json({
          leaderboard: [],
          stats: { totalUsers: 0, avgDiversity: 0, avgUpdates: 0 },
        });
      }
      throw error;
    }

    // Calculate some aggregate stats
    const stats = {
      totalUsers: data?.length || 0,
      avgDiversity: data?.reduce((sum, user) => sum + (user.diversity_score || 0), 0) / (data?.length || 1),
      avgUpdates: data?.reduce((sum, user) => sum + user.times_updated, 0) / (data?.length || 1),
    };

    return NextResponse.json({
      leaderboard: data || [],
      stats,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
