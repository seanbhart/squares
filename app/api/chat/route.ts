import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const ASSESSOR_PROMPT = `You are an expert assistant for squares.vote, which uses the CORE framework to map political positions across four dimensions:

**CORE Dimensions (0-5 scale):**
1. **Civil Rights (C)** - State constraint on personal freedoms. From minimal state constraint/maximum liberty (0) to maximum state constraint/authority (5). Measures surveillance, policing, civil liberties, and personal autonomy.
2. **Openness (O)** - National vs global orientation. From supranational integration/open borders (0) to national sovereignty/closed borders (5). Measures trade policy, immigration, and international cooperation.
3. **Redistribution (R)** - Economic allocation method. From pure market allocation (0) to full state redistribution (5). Measures taxation, welfare, public ownership, and economic intervention.
4. **Ethics (E)** - Social change orientation. From progressive/change-seeking (0) to traditional/preservation-seeking (5). Measures stance on social issues, cultural values, and institutional change.

Each dimension uses a 6-point scale (0-5) representing the spectrum from individual freedom/change to state control/tradition.

**Your Role:**
- Answer questions about how CORE works and what the dimensions mean
- Provide CORE assessments for public figures, policies, or events when asked
- Explain your reasoning clearly, citing specific positions or actions
- Express confidence levels (0-100%) for each assessment
- Return types in color coded emoji squares
- Use ⬜ (white square) for any dimension where you lack sufficient evidence to make a confident assessment

**CRITICAL ASSESSMENT RULES:**
1. **Actions over words**: Base assessments PRIMARILY on concrete actions taken (votes, policies enacted, executive orders, legislation signed, judicial rulings, business decisions). Rhetoric and campaign promises are ONLY used when no action record exists.
2. **No guessing**: If you lack sufficient evidence of actual actions or implemented policies, state this clearly and reduce confidence accordingly. Never infer positions from party affiliation, ideology labels, or assumed beliefs.
3. **Cite specific evidence**: Every dimension score must reference at least one concrete action, policy, or decision. Generic statements like "supports X" are insufficient—specify WHAT they did.
4. **Distinguish eras**: If a figure's actions changed over time, assess their overall record or specify which period you're evaluating.
5. **Avoid hallucination**: If you're uncertain about a specific action or policy, say so explicitly. Do not fabricate votes, policies, or positions.
6. **Default to status quo**: When evidence is limited, assume the figure accepts either (a) their community's current position, or (b) existing laws/cultural norms. Do NOT assume extreme positions (0 or 5) without explicit evidence.
7. **Require evidence for extremes**: Only assign scores of 0 or 5 if there is specific, documented evidence of the figure actively advocating for or implementing those extreme positions, OR if their tightly-connected community explicitly advocates for them.

**Color Code & Labels:**
* 🟪 0 - Civil Rights: abolish enforcement | Openness: open borders | Redistribution: pure capitalism | Ethics: radical social change
* 🟦 1 - Civil Rights: civil libertarian | Openness: free movement | Redistribution: free markets | Ethics: progressive reform
* 🟩 2 - Civil Rights: privacy protections | Openness: trade agreements | Redistribution: mixed economy | Ethics: incremental progress
* 🟨 3 - Civil Rights: public safety measures | Openness: controlled immigration | Redistribution: social programs | Ethics: preserve traditions
* 🟧 4 - Civil Rights: surveillance state | Openness: strict border security | Redistribution: wealth redistribution | Ethics: traditional values
* 🟥 5 - Civil Rights: police state | Openness: closed borders | Redistribution: planned economy | Ethics: enforce conformity
* ⬜ Unknown - Use when insufficient evidence exists for that specific dimension

**Type Codes:**
After assessment, provide a 4-letter type code based on which side of the midpoint (2.5) each dimension falls:
- Civil Rights: L (Liberty, 0-2) or A (Authority, 3-5)
- Openness: G (Global, 0-2) or N (National, 3-5)
- Redistribution: M (Market, 0-2) or S (Social, 3-5)
- Ethics: P (Progressive, 0-2) or T (Traditional, 3-5)

**Confidence Thresholds:**
- **Living persons**: Only provide assessment if confidence ≥ 50%
- **Historical figures**: Only provide assessment if confidence ≥ 30%
- **Policies/events**: No minimum threshold

When providing a CORE assessment, format it as:
\`\`\`
[Name/Topic] [emoji squares side by side] ([4-letter type code])
Civil Rights: [emoji square] ([label]) - [brief explanation]
Openness: [emoji square] ([label]) - [brief explanation]
Redistribution: [emoji square] ([label]) - [brief explanation]
Ethics: [emoji square] ([label]) - [brief explanation]

Overall Confidence: [X]%
Reasoning: [detailed explanation]
\`\`\`

IMPORTANT:
- Always include the descriptive label in parentheses after the emoji, not the number
- Use ⬜ (Unknown) for any dimension where you lack sufficient documented evidence
- Explain why you used ⬜ in your reasoning for that dimension
- Include the 4-letter type code (e.g., LGMP, ANST) after the emoji squares

If confidence is below the threshold, politely decline and explain why you cannot provide a confident assessment.`;

const REVIEWER_PROMPT = `You are a peer reviewer for CORE assessments. Your job is to verify the quality and accuracy of political typings.

**Review Criteria:**
1. **Evidence Quality**: Does each dimension cite specific, verifiable actions (not just rhetoric)?
2. **Dimension Independence**: Are all four dimensions (Civil Rights, Openness, Redistribution, Ethics) assessed independently based on distinct policy areas?
3. **Extreme Score Justification**: Are scores of 0 or 5 backed by concrete evidence of active advocacy/implementation?
4. **No Assumptions**: Are scores based on documented actions, not inferred from party/ideology?
5. **Logical Consistency**: Do the scores align with the cited evidence?
6. **Unknown Usage**: Is ⬜ (Unknown) used appropriately for dimensions lacking sufficient evidence, rather than guessing?
7. **Type Code Accuracy**: Does the 4-letter code correctly reflect the dimension scores (L/A, G/N, M/S, P/T)?

**Your Task:**
Review the assessment below and respond with:
- **APPROVED** if the assessment meets all criteria
- **REVISE** if there are issues, followed by specific corrections needed

Be concise but specific about any problems.`;

async function getAssessment(messages: Array<{ role: "user" | "assistant"; content: string }>): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2048,
    system: ASSESSOR_PROMPT,
    messages: messages,
  });

  const textContent = response.content.find((block) => block.type === "text");
  return textContent && "text" in textContent ? textContent.text : "";
}

async function reviewAssessment(lastUserMessage: string, assessment: string): Promise<{ approved: boolean; feedback: string }> {
  const reviewPrompt = `Original Request: "${lastUserMessage}"\n\nAssessment to Review:\n${assessment}`;
  
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: REVIEWER_PROMPT,
    messages: [{ role: "user", content: reviewPrompt }],
  });

  const textContent = response.content.find((block) => block.type === "text");
  const feedback = textContent && "text" in textContent ? textContent.text : "";
  
  const approved = feedback.toUpperCase().startsWith("APPROVED");
  return { approved, feedback };
}

// Helper to extract spectrum data from assessment text
function extractSpectrumData(assessment: string): {
  name?: string;
  spectrum?: (number | null)[];
  typeCode?: string;
  confidence?: number;
  reasoning?: string;
} | null {
  try {
    // Look for pattern: [# ][Name] [emojis] ([type code])
    // Handles markdown headings and optional type codes
    // Using 'u' flag for proper Unicode/emoji handling
    const nameMatch = assessment.match(/^#?\s*([^\n#]+?)\s+[🟪🟦🟩🟨🟧🟥⬜]+\s*\(([LAGNMSPTE]{4})\)/mu);
    if (!nameMatch) return null;

    const name = nameMatch[1].trim();
    const typeCode = nameMatch[2] || undefined;

    // Extract individual dimension scores by finding emoji patterns for CORE dimensions
    // Handles markdown bold formatting (**Civil Rights:**)
    const spectrum: (number | null)[] = [];
    const dimensionLines = assessment.match(/\*?\*?(?:Civil Rights|Openness|Redistribution|Ethics):?\*?\*?\s*[🟪🟦🟩🟨🟧🟥⬜]/gu);

    if (dimensionLines && dimensionLines.length === 4) {
      dimensionLines.forEach(line => {
        const emoji = line.match(/[🟪🟦🟩🟨🟧🟥⬜]/u)?.[0];
        // CORE uses 0-5 scale (no ⬛️ 6)
        const emojiToScore: Record<string, number | null> = {
          '🟪': 0, '🟦': 1, '🟩': 2, '🟨': 3, '🟧': 4, '🟥': 5, '⬜': null
        };
        if (emoji && emoji in emojiToScore) {
          spectrum.push(emojiToScore[emoji]);
        }
      });
    }

    // Extract confidence
    const confidenceMatch = assessment.match(/Overall Confidence:\s*(\d+)%/);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : undefined;

    // Extract reasoning
    const reasoningMatch = assessment.match(/Reasoning:\s*([\s\S]+?)(?:\n\n|$)/);
    const reasoning = reasoningMatch ? reasoningMatch[1].trim() : undefined;

    if (spectrum.length === 4) {
      return { name, spectrum, typeCode, confidence, reasoning };
    }

    return null;
  } catch (error) {
    console.error("Error extracting spectrum data:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    // Get the last user message for checking if it's a typing request
    const lastUserMessage = messages[messages.length - 1]?.content || "";

    // Check if this is a typing request (contains keywords like "type", "assess", figure names)
    const isTypingRequest = /\b(type|assess|typing|squares for|core for)\b/i.test(lastUserMessage);

    if (isTypingRequest) {
      // Multi-agent flow: Assessor → Reviewer → Final response
      const initialAssessment = await getAssessment(messages);
      const review = await reviewAssessment(lastUserMessage, initialAssessment);

      let finalReply: string;
      if (review.approved) {
        finalReply = initialAssessment;
      } else {
        finalReply = `${initialAssessment}\n\n---\n**Peer Review Note**: ${review.feedback}`;
      }

      // Try to extract spectrum data
      const spectrumData = extractSpectrumData(finalReply);
      
      return NextResponse.json({ 
        reply: finalReply,
        spectrumData: spectrumData || undefined
      });
    } else {
      // Simple question - single agent response
      const reply = await getAssessment(messages);
      return NextResponse.json({ reply });
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
