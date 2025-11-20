import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = 'edge';

// GET - Fetch spectrum for a specific FID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fid = searchParams.get('fid');

    if (!fid) {
      return NextResponse.json(
        { error: 'FID is required' },
        { status: 400 }
      );
    }

    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from('farcaster_spectrums')
      .select('*')
      .eq('fid', parseInt(fid))
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is ok
      if (error.code === '42P01') {
        return NextResponse.json({ spectrum: null });
      }
      throw error;
    }

    return NextResponse.json({ spectrum: data });
  } catch (error) {
    console.error('Error fetching spectrum:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spectrum' },
      { status: 500 }
    );
  }
}

// POST - Create or update spectrum
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[API] Received POST request body:', body);
    
    const {
      fid,
      username,
      displayName,
      pfpUrl,
      spectrum,
      isPublic = false,
    } = body;

    if (!fid || !spectrum) {
      return NextResponse.json(
        { error: 'FID and spectrum are required' },
        { status: 400 }
      );
    }

    // Validate spectrum values (CORE: 0-5)
    const requiredKeys = ['civilRights', 'openness', 'redistribution', 'ethics'];
    for (const key of requiredKeys) {
      if (spectrum[key] === undefined || spectrum[key] < 0 || spectrum[key] > 5) {
        return NextResponse.json(
          { error: `Invalid ${key} value. Must be between 0-5` },
          { status: 400 }
        );
      }
    }

    const supabase = await supabaseServer();

    // Check if spectrum already exists
    const { data: existing } = await supabase
      .from('farcaster_spectrums')
      .select('*')
      .eq('fid', fid)
      .single();

    const spectrumData = {
      fid: parseInt(fid),
      username: username || null,
      display_name: displayName || null,
      pfp_url: pfpUrl || null,
      civil_rights_score: spectrum.civilRights,
      openness_score: spectrum.openness,
      redistribution_score: spectrum.redistribution,
      ethics_score: spectrum.ethics,
      is_public: isPublic,
    };

    if (existing) {
      const { data, error } = await supabase
        .from('farcaster_spectrums')
        .update(spectrumData)
        .eq('fid', fid)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        spectrum: data,
        updated: true,
      });
    } else {
      const { data, error } = await supabase
        .from('farcaster_spectrums')
        .insert(spectrumData)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        spectrum: data,
        updated: false,
      });
    }
  } catch (error) {
    console.error('Error saving spectrum:', error);
    return NextResponse.json(
      { error: 'Failed to save spectrum' },
      { status: 500 }
    );
  }
}
