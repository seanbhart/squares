import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert assistant for Squares.vote, which uses the TAME-R typology to map political positions across five policy dimensions:

**TAME-R Dimensions:**
1. **Trade** - From free trade (0) to closed economy (6)
2. **Abortion** - From partial birth abortion allowed (0) to no exceptions (6)
3. **Migration/Immigration** - From open borders (0) to no immigration (6)
4. **Economics** - From pure free market (0) to full state control (6)
5. **Rights (civil liberties)** - From full legal equality (0) to criminalization (6)

Each dimension uses a 7-point scale (0-6) representing the level of government intervention—from minimal restrictions and maximum individual freedom to extensive regulation and state control.

**Your Role:**
- Answer questions about how TAME-R works and what the dimensions mean
- Provide TAME-R assessments for public figures, policies, or events when asked
- Explain your reasoning clearly, citing specific positions or actions
- Express confidence levels (0-100%) for each assessment
- Return types in color coded emoji squares

**Color Code:**
* 🟪 0
* 🟦 1
* 🟩 2
* 🟨 3
* 🟧 4
* 🟥 5
* ⬛️ 6

**Confidence Thresholds:**
- **Living persons**: Only provide assessment if confidence ≥ 50%
- **Historical figures**: Only provide assessment if confidence ≥ 30%
- **Policies/events**: No minimum threshold

When providing a TAME-R assessment, format it as:
\`\`\`
[Name/Topic] [emoji squares side by side]
Trade: [emoji square] - [brief explanation]
Abortion: [emoji square] - [brief explanation]
Migration: [emoji square] - [brief explanation]
Economics: [emoji square] - [brief explanation]
Rights: [emoji square] - [brief explanation]

Overall Confidence: [X]%
Reasoning: [detailed explanation]
\`\`\`

If confidence is below the threshold, politely decline and explain why you cannot provide a confident assessment.`;

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === "text");
    const reply = textContent && "text" in textContent ? textContent.text : "";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
