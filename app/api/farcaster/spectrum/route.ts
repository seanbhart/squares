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
      // 42P01 is "table doesn't exist", also ok for first time
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

    console.log('[API] Parsed values:', { fid, username, displayName, pfpUrl, spectrum, isPublic });

    if (!fid || !spectrum) {
      console.log('[API] Missing required fields');
      return NextResponse.json(
        { error: 'FID and spectrum are required' },
        { status: 400 }
      );
    }

    // Validate spectrum values
    const requiredKeys = ['trade', 'abortion', 'migration', 'economics', 'rights'];
    for (const key of requiredKeys) {
      if (spectrum[key] === undefined || spectrum[key] < 0 || spectrum[key] > 6) {
        return NextResponse.json(
          { error: `Invalid ${key} value. Must be between 0-6` },
          { status: 400 }
        );
      }
    }

    const supabase = await supabaseServer();

    // Check if spectrum already exists
    console.log('[API] Checking for existing spectrum...');
    const { data: existing, error: fetchError } = await supabase
      .from('farcaster_spectrums')
      .select('*')
      .eq('fid', fid)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.log('[API] Error checking existing:', fetchError);
    }
    console.log('[API] Existing spectrum:', existing);

    const spectrumData = {
      fid: parseInt(fid),
      username: username || null,
      display_name: displayName || null,
      pfp_url: pfpUrl || null,
      trade_score: spectrum.trade,
      abortion_score: spectrum.abortion,
      migration_score: spectrum.migration,
      economics_score: spectrum.economics,
      rights_score: spectrum.rights,
      is_public: isPublic,
    };

    console.log('[API] Spectrum data to save:', spectrumData);

    if (existing) {
      // Update existing spectrum
      console.log('[API] Updating existing spectrum for FID:', fid);
      const { data, error } = await supabase
        .from('farcaster_spectrums')
        .update(spectrumData)
        .eq('fid', fid)
        .select()
        .single();

      if (error) {
        console.error('[API] Update error:', error);
        throw error;
      }

      console.log('[API] Successfully updated:', data);

      return NextResponse.json({
        success: true,
        spectrum: data,
        updated: true,
      });
    } else {
      // Insert new spectrum
      console.log('[API] Inserting new spectrum for FID:', fid);
      const { data, error } = await supabase
        .from('farcaster_spectrums')
        .insert(spectrumData)
        .select()
        .single();

      if (error) {
        console.error('[API] Insert error:', error);
        throw error;
      }

      console.log('[API] Successfully inserted:', data);

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
