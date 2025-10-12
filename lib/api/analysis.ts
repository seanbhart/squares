import type { Figure } from './figures';

/**
 * Request AI analysis for a new or existing figure
 */
export async function analyzeFigure(params: {
  figureName: string;
  contextNotes?: string;
  requestType: 'new' | 'reanalysis';
  figureId?: string;
}): Promise<{ requestId: string; figureId: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/functions/v1/analyze-figure`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze figure');
  }

  return response.json();
}

/**
 * Get the status of an analysis request
 */
export async function getAnalysisStatus(requestId: string): Promise<{
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  figure?: Figure;
  error?: string;
  completedAt?: string;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SUPABASE_ANON_KEY;

  const response = await fetch(
    `${supabaseUrl}/functions/v1/get-analysis-status?requestId=${requestId}`,
    {
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get analysis status');
  }

  return response.json();
}
