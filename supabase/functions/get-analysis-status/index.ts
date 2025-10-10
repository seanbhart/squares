import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const requestId = url.searchParams.get('requestId');

    if (!requestId) {
      throw new Error('requestId parameter is required');
    }

    // Get analysis request
    const { data: analysisRequests, error } = await supabaseClient
      .from('analysis_requests')
      .select('*')
      .eq('id', requestId);

    if (error || !analysisRequests || analysisRequests.length === 0) {
      throw new Error(`Analysis request not found: ${error?.message || 'No results'}`);
    }

    const analysisRequest = analysisRequests[0];

    // If completed, also fetch the figure data
    let figure = null;
    if (analysisRequest.status === 'completed' && analysisRequest.figure_id) {
      const { data: figureData, error: figureError } = await supabaseClient
        .from('figures')
        .select('id, name, lifespan, spectrum')
        .eq('id', analysisRequest.figure_id)
        .single();

      if (!figureError && figureData) {
        // Also get timeline
        const { data: timelineData } = await supabaseClient
          .from('timeline_entries')
          .select('label, spectrum, note')
          .eq('figure_id', analysisRequest.figure_id)
          .order('entry_order');

        figure = {
          ...figureData,
          timeline: timelineData || [],
        };
      }
    }

    return new Response(
      JSON.stringify({
        requestId: analysisRequest.id,
        status: analysisRequest.status,
        figure: figure,
        error: analysisRequest.error_message,
        completedAt: analysisRequest.completed_at,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
