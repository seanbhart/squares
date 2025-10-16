/**
 * GET /api/v1/usage
 * Get current usage statistics for the authenticated API key
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api/auth';
import { getUsageStats } from '@/lib/api/rate-limit';
import { handleError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Authenticate API key
    const authResult = await validateApiKey(request);
    if (authResult instanceof Response) {
      return authResult;
    }
    
    const { key } = authResult;
    
    // Get usage statistics
    const stats = await getUsageStats(key);
    
    return NextResponse.json(stats);
  } catch (error) {
    return handleError(error);
  }
}
