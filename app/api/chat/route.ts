import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { POLICIES, EMOJI_SQUARES } from "@/lib/tamer-config";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const ASSESSOR_PROMPT = `You are an expert assistant for squares.vote, which uses the TAME-R typology to map political positions across five policy dimensions:

**TAME-R Dimensions:**
1. **Trade** - Government intervention in EXTERNAL economic interactions. From unrestricted free trade with foreign markets (0) to protectionist tariffs and closed borders to goods/capital (6). This measures barriers to international commerce, NOT domestic economic policy.
2. **Abortion** - From partial birth abortion allowed (0) to no exceptions (6)
3. **Migration/Immigration** - From open borders (0) to no immigration (6)
4. **Economics** - DOMESTIC capital ownership and economic planning. From pure private ownership/free market (0) to full state ownership/central planning (6). This measures public vs. private control of production, NOT trade policy.
5. **Rights (civil liberties)** - From full legal equality (0) to criminalization (6)

Each dimension uses a 7-point scale (0-6) representing the level of government intervention—from minimal restrictions and maximum individual freedom to extensive regulation and state control.

**IMPORTANT**: Trade and Economics are SEPARATE dimensions. A figure can support free trade (low Trade score) while favoring state ownership (high Economics score), or vice versa. Always assess them independently based on distinct policy areas.

**Your Role:**
- Answer questions about how TAME-R works and what the dimensions mean
- Provide TAME-R assessments for public figures, policies, or events when asked
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
6. **Default to status quo**: When evidence is limited, assume the figure accepts either (a) their community's current position, or (b) existing laws/cultural norms. Do NOT assume extreme positions (0-1 or 5-6) without explicit evidence.
7. **Require evidence for extremes**: Only assign scores of 0-1 or 5-6 if there is specific, documented evidence of the figure actively advocating for or implementing those extreme positions, OR if their tightly-connected community explicitly advocates for them.

**Color Code & Labels:**
* 🟪 0 - Trade: free trade | Abortion: partial birth abortion | Migration: open borders | Economics: pure free market | Rights: full legal equality
* 🟦 1 - Trade: minimal tariffs | Abortion: limit after viability | Migration: easy pathways to citizenship | Economics: minimal regulation | Rights: protections with few limits
* 🟩 2 - Trade: selective trade agreements | Abortion: limit after third trimester | Migration: expanded quotas | Economics: market-based with safety net | Rights: protections with some limits
* 🟨 3 - Trade: balanced tariffs | Abortion: limit after second trimester | Migration: current restrictions | Economics: balanced public-private | Rights: tolerance without endorsement
* 🟧 4 - Trade: strategic protections | Abortion: limit after first trimester | Migration: reduced quotas | Economics: strong social programs | Rights: traditional definitions only
* 🟥 5 - Trade: heavy tariffs | Abortion: limit after heartbeat detection | Migration: strict limits only | Economics: extensive public ownership | Rights: no legal recognition
* ⬛️ 6 - Trade: closed economy | Abortion: no exceptions allowed | Migration: no immigration | Economics: full state control | Rights: criminalization
* ⬜ Unknown - Use when insufficient evidence exists for that specific dimension

**Confidence Thresholds:**
- **Living persons**: Only provide assessment if confidence ≥ 50%
- **Historical figures**: Only provide assessment if confidence ≥ 30%
- **Policies/events**: No minimum threshold

When providing a TAME-R assessment, format it as:
\`\`\`
[Name/Topic] [emoji squares side by side]
Trade: [emoji square] ([label]) - [brief explanation]
Abortion: [emoji square] ([label]) - [brief explanation]
Migration: [emoji square] ([label]) - [brief explanation]
Economics: [emoji square] ([label]) - [brief explanation]
Rights: [emoji square] ([label]) - [brief explanation]

Overall Confidence: [X]%
Reasoning: [detailed explanation]
\`\`\`

IMPORTANT: 
- Always include the descriptive label in parentheses after the emoji, not the number
- Use ⬜ (Unknown) for any dimension where you lack sufficient documented evidence
- Explain why you used ⬜ in your reasoning for that dimension

If confidence is below the threshold, politely decline and explain why you cannot provide a confident assessment.`;

const REVIEWER_PROMPT = `You are a peer reviewer for TAME-R assessments. Your job is to verify the quality and accuracy of political typings.

**Review Criteria:**
1. **Evidence Quality**: Does each dimension cite specific, verifiable actions (not just rhetoric)?
2. **Trade vs Economics Separation**: Are Trade (external commerce) and Economics (domestic ownership) assessed independently?
3. **Extreme Score Justification**: Are scores of 0-1 or 5-6 backed by concrete evidence of active advocacy/implementation?
4. **No Assumptions**: Are scores based on documented actions, not inferred from party/ideology?
5. **Logical Consistency**: Do the scores align with the cited evidence?
6. **Unknown Usage**: Is ⬜ (Unknown) used appropriately for dimensions lacking sufficient evidence, rather than guessing?

**Your Task:**
Review the assessment below and respond with:
- **APPROVED** if the assessment meets all criteria
- **REVISE** if there are issues, followed by specific corrections needed

Be concise but specific about any problems.`;

async function getAssessment(userMessage: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2048,
    system: ASSESSOR_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const textContent = response.content.find((block) => block.type === "text");
  return textContent && "text" in textContent ? textContent.text : "";
}

async function reviewAssessment(userMessage: string, assessment: string): Promise<{ approved: boolean; feedback: string }> {
  const reviewPrompt = `Original Request: "${userMessage}"\n\nAssessment to Review:\n${assessment}`;
  
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
  confidence?: number;
  reasoning?: string;
} | null {
  try {
    // Look for pattern: [Name] [emojis]
    const nameMatch = assessment.match(/^([^\n\[]+?)(?:\s+[🟪🟦🟩🟨🟧🟥⬛️⬜]+)/m);
    if (!nameMatch) return null;

    const name = nameMatch[1].trim();
    
    // Extract individual dimension scores by finding emoji patterns
    const spectrum: (number | null)[] = [];
    const dimensionLines = assessment.match(/(?:Trade|Abortion|Migration|Economics|Rights):\s*([🟪🟦🟩🟨🟧🟥⬛️⬜])/g);
    
    if (dimensionLines && dimensionLines.length === 5) {
      dimensionLines.forEach(line => {
        const emoji = line.match(/([🟪🟦🟩🟨🟧🟥⬛️⬜])/)?.[1];
        const emojiToScore: Record<string, number | null> = {
          '🟪': 0, '🟦': 1, '🟩': 2, '🟨': 3, '🟧': 4, '🟥': 5, '⬛️': 6, '⬛': 6, '⬜': null
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

    if (spectrum.length === 5) {
      return { name, spectrum, confidence, reasoning };
    }
    
    return null;
  } catch (error) {
    console.error("Error extracting spectrum data:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    // Check if this is a typing request (contains keywords like "type", "assess", figure names)
    const isTypingRequest = /\b(type|assess|typing|squares for|tamer for)\b/i.test(message);

    if (isTypingRequest) {
      // Multi-agent flow: Assessor → Reviewer → Final response
      const initialAssessment = await getAssessment(message);
      const review = await reviewAssessment(message, initialAssessment);

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
      const reply = await getAssessment(message);
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
