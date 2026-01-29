import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { createClient, Errors } from '@farcaster/quick-auth';

export const runtime = 'edge';

// Create the Quick Auth client for JWT verification
const quickAuthClient = createClient();

// Domain for JWT verification - must match the domain the miniapp is served from
const HOSTNAME = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NEXT_PUBLIC_BASE_URL || 'https://farcaster.squares.vote';

// Extract just the hostname without protocol
function getDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    // If it's already just a hostname
    return url.replace(/^https?:\/\//, '').split('/')[0];
  }
}

/**
 * Verify the Farcaster Quick Auth JWT token from the Authorization header.
 * Returns the FID from the token if valid, or null if verification fails.
 */
async function verifyFarcasterAuth(request: NextRequest): Promise<{ fid: number } | { error: string; status: number }> {
  const authorization = request.headers.get('Authorization');

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return { error: 'Missing or invalid Authorization header', status: 401 };
  }

  const token = authorization.split(' ')[1];

  try {
    const payload = await quickAuthClient.verifyJwt({
      token,
      domain: getDomain(HOSTNAME),
    });

    return { fid: payload.sub };
  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      console.error('[Spectrum API] Invalid token:', e.message);
      return { error: 'Invalid authentication token', status: 401 };
    }
    console.error('[Spectrum API] Token verification error:', e);
    return { error: 'Authentication verification failed', status: 500 };
  }
}

// GET - Fetch spectrum for a specific FID
// Only returns public spectrums unless the requester is authenticated as the FID owner
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

    // Validate FID is a valid number
    const fidNum = parseInt(fid);
    if (isNaN(fidNum)) {
      return NextResponse.json(
        { error: 'Invalid FID format' },
        { status: 400 }
      );
    }

    // Check if requester is authenticated as this FID
    let isOwner = false;
    const authResult = await verifyFarcasterAuth(request);
    if (!('error' in authResult) && authResult.fid === fidNum) {
      isOwner = true;
    }

    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from('farcaster_spectrums')
      .select('*')
      .eq('fid', fidNum)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is ok
      if (error.code === '42P01') {
        return NextResponse.json({ spectrum: null });
      }
      throw error;
    }

    // If data exists but is not public and requester is not the owner, don't expose it
    if (data && !data.is_public && !isOwner) {
      return NextResponse.json({ spectrum: null });
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
    // Verify Farcaster Quick Auth token to ensure the user owns the FID
    const authResult = await verifyFarcasterAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    const authenticatedFid = authResult.fid;

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

    // Critical security check: Ensure the authenticated FID matches the requested FID
    if (authenticatedFid !== parseInt(fid.toString())) {
      console.error(`[Spectrum API] FID mismatch: authenticated FID ${authenticatedFid} tried to update FID ${fid}`);
      return NextResponse.json(
        { error: 'Not authorized to update this spectrum' },
        { status: 403 }
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
      core_is_user_set: true,
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
