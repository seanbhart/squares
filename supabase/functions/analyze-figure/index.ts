import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.32.1';

// Fallback prompts if database fetch fails
const FALLBACK_ASSESSOR_PROMPT = `You are an expert assistant for Squares.vote, which uses the TAME-R typology to map political positions across five policy dimensions:

**TAME-R Dimensions:**
1. **Trade** - Government intervention in EXTERNAL economic interactions. From unrestricted free trade with foreign markets (0) to protectionist tariffs and closed borders to goods/capital (6). This measures barriers to international commerce, NOT domestic economic policy.
2. **Abortion** - From partial birth abortion allowed (0) to no exceptions (6)
3. **Migration/Immigration** - From open borders (0) to no immigration (6)
4. **Economics** - DOMESTIC capital ownership and economic planning. From pure private ownership/free market (0) to full state ownership/central planning (6). This measures public vs. private control of production, NOT trade policy.
5. **Rights (civil liberties)** - From full legal equality (0) to criminalization (6)

Each dimension uses a 7-point scale (0-6) representing the level of government intervention—from minimal restrictions and maximum individual freedom to extensive regulation and state control.

**IMPORTANT**: Trade and Economics are SEPARATE dimensions. A figure can support free trade (low Trade score) while favoring state ownership (high Economics score), or vice versa. Always assess them independently based on distinct policy areas.

**Your Role:**
- Provide TAME-R assessments for public figures
- Explain your reasoning clearly, citing specific positions or actions
- Express confidence levels (0-100%) for each assessment

**CRITICAL ASSESSMENT RULES:**
1. **Actions over words**: Base assessments PRIMARILY on concrete actions taken (votes, policies enacted, executive orders, legislation signed, judicial rulings, business decisions). Rhetoric and campaign promises are ONLY used when no action record exists.
2. **No guessing**: If you lack sufficient evidence of actual actions or implemented policies, state this clearly and reduce confidence accordingly. Never infer positions from party affiliation, ideology labels, or assumed beliefs.
3. **Cite specific evidence**: Every dimension score must reference at least one concrete action, policy, or decision. Generic statements like "supports X" are insufficient—specify WHAT they did.
4. **Distinguish eras**: If a figure's actions changed over time, assess their overall record or specify which period you're evaluating.
5. **Avoid hallucination**: If you're uncertain about a specific action or policy, say so explicitly. Do not fabricate votes, policies, or positions.
6. **Default to status quo**: When evidence is limited, assume the figure accepts either (a) their community's current position, or (b) existing laws/cultural norms. Do NOT assume extreme positions (0-1 or 5-6) without explicit evidence.
7. **Require evidence for extremes**: Only assign scores of 0-1 or 5-6 if there is specific, documented evidence of the figure actively advocating for or implementing those extreme positions, OR if their tightly-connected community explicitly advocates for them.

**Confidence Thresholds:**
- **Living persons**: Only provide assessment if confidence ≥ 50%
- **Historical figures**: Only provide assessment if confidence ≥ 30%

When providing a TAME-R assessment, format it as JSON:
{
  "spectrum": [trade, abortion, migration, economics, rights],
  "confidence": 75,
  "reasoning": "detailed explanation with specific evidence",
  "timeline": [
    {
      "label": "Period description",
      "spectrum": [trade, abortion, migration, economics, rights],
      "note": "Brief explanation of this period"
    }
  ]
}

The timeline should include 2-4 key periods in the figure's career that show evolution or consistency in their positions.

Return ONLY valid JSON, no other text.`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyzeRequest {
  figureName: string;
  contextNotes?: string;
  requestType: 'new' | 'reanalysis';
  figureId?: string;
}

interface AssessmentResult {
  spectrum: number[];
  confidence: number;
  reasoning: string;
  timeline: Array<{
    label: string;
    spectrum: number[];
    note: string;
  }>;
}

async function getSystemPrompts(supabaseClient: any): Promise<{ assessor: string; reviewer?: string }> {
  try {
    const { data, error } = await supabaseClient
      .from('system_prompts')
      .select('assessor_prompt, reviewer_prompt')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.warn('Failed to fetch prompts from database, using fallback');
      return { assessor: FALLBACK_ASSESSOR_PROMPT };
    }

    return {
      assessor: data.assessor_prompt || FALLBACK_ASSESSOR_PROMPT,
      reviewer: data.reviewer_prompt,
    };
  } catch (error) {
    console.warn('Error fetching prompts:', error);
    return { assessor: FALLBACK_ASSESSOR_PROMPT };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const anthropic = new Anthropic({
      apiKey: Deno.env.get('CLAUDE_API_KEY') ?? '',
    });

    const { figureName, contextNotes, requestType, figureId }: AnalyzeRequest = await req.json();

    // Fetch system prompts from database
    const prompts = await getSystemPrompts(supabaseClient);

    // Create analysis request record
    const { data: analysisRequest, error: insertError } = await supabaseClient
      .from('analysis_requests')
      .insert({
        figure_name: figureName,
        status: 'processing',
        request_type: requestType,
        figure_id: figureId || null,
        context_notes: contextNotes || null,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create analysis request: ${insertError.message}`);
    }

    try {
      // Get AI assessment
      const prompt = contextNotes
        ? `Provide a TAME-R assessment for: ${figureName}\n\nAdditional context: ${contextNotes}`
        : `Provide a TAME-R assessment for: ${figureName}`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 4096,
        system: prompts.assessor,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textContent = response.content.find((block: any) => block.type === 'text');
      let text = textContent && 'text' in textContent ? textContent.text : '{}';

      // Strip markdown code fences if present
      text = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();

      const assessment: AssessmentResult = JSON.parse(text);

      // Validate assessment
      if (
        !assessment.spectrum ||
        assessment.spectrum.length !== 5
      ) {
        console.error('Invalid assessment:', JSON.stringify(assessment));
        throw new Error(`Invalid assessment format from AI: missing or invalid spectrum. Got: ${JSON.stringify(assessment)}`);
      }

      // Timeline is optional - if not provided, create a default one
      if (!assessment.timeline || assessment.timeline.length === 0) {
        assessment.timeline = [
          {
            label: 'Overall Career',
            spectrum: assessment.spectrum,
            note: assessment.reasoning.substring(0, 200),
          },
        ];
      }

      // If this is a new figure, create it
      let finalFigureId = figureId;
      if (requestType === 'new') {
        const { data: newFigure, error: figureError } = await supabaseClient.rpc(
          'insert_figure_with_timeline',
          {
            p_name: figureName,
            p_lifespan: 'TBD', // Can be updated later
            p_spectrum: assessment.spectrum,
            p_is_featured: false,
            p_featured_order: null,
            p_timeline: assessment.timeline,
            p_created_by: null,
          }
        );

        if (figureError) {
          throw new Error(`Failed to create figure: ${figureError.message}`);
        }

        finalFigureId = newFigure;
      } else if (requestType === 'reanalysis' && figureId) {
        // Update existing figure
        const { error: updateError } = await supabaseClient.rpc('update_figure_spectrum', {
          p_figure_id: figureId,
          p_new_spectrum: assessment.spectrum,
          p_reason: 'AI reanalysis',
          p_changed_by: null,
        });

        if (updateError) {
          throw new Error(`Failed to update figure: ${updateError.message}`);
        }

        // Delete old timeline entries
        await supabaseClient.from('timeline_entries').delete().eq('figure_id', figureId);

        // Insert new timeline entries
        for (let i = 0; i < assessment.timeline.length; i++) {
          const entry = assessment.timeline[i];
          await supabaseClient.from('timeline_entries').insert({
            figure_id: figureId,
            label: entry.label,
            spectrum: entry.spectrum,
            note: entry.note,
            entry_order: i,
          });
        }
      }

      // Update analysis request as completed
      await supabaseClient
        .from('analysis_requests')
        .update({
          status: 'completed',
          figure_id: finalFigureId,
          ai_analysis: assessment,
          completed_at: new Date().toISOString(),
        })
        .eq('id', analysisRequest.id);

      return new Response(
        JSON.stringify({
          requestId: analysisRequest.id,
          figureId: finalFigureId,
          assessment,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (error: any) {
      // Update analysis request as failed
      await supabaseClient
        .from('analysis_requests')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString(),
        })
        .eq('id', analysisRequest.id);

      throw error;
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
