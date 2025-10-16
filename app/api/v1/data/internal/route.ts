/**
 * Internal proxy endpoint for the /data page
 * This allows the public-facing /data page to work without exposing API keys to the client
 * Uses a special internal API key with higher rate limits
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Forward request to the main data endpoint with internal API key
  const apiUrl = new URL('/api/v1/data/spectrums', request.url);
  apiUrl.search = searchParams.toString();
  
  // Use internal API key (set in environment variables)
  const internalApiKey = process.env.INTERNAL_DATA_API_KEY;
  
  if (!internalApiKey) {
    console.error('INTERNAL_DATA_API_KEY not configured');
    return NextResponse.json(
      { error: 'configuration_error', message: 'Internal API key not configured' },
      { status: 500 }
    );
  }
  
  try {
    const response = await fetch(apiUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${internalApiKey}`,
      },
    });
    
    const data = await response.json();
    
    // Forward the response
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error forwarding to data endpoint:', error);
    return NextResponse.json(
      { error: 'proxy_error', message: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
