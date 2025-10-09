#!/usr/bin/env tsx

import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const ASSESSOR_PROMPT = `You are an expert assistant for Squares.vote, which uses the TAME-R typology to map political positions across five policy dimensions:

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
  "reasoning": "detailed explanation with specific evidence"
}

Return ONLY valid JSON, no other text.`;

const REVIEWER_PROMPT = `You are a peer reviewer for TAME-R assessments. Your job is to verify the quality and accuracy of political typings.

**Review Criteria:**
1. **Evidence Quality**: Does each dimension cite specific, verifiable actions (not just rhetoric)?
2. **Trade vs Economics Separation**: Are Trade (external commerce) and Economics (domestic ownership) assessed independently?
3. **Extreme Score Justification**: Are scores of 0-1 or 5-6 backed by concrete evidence of active advocacy/implementation?
4. **No Assumptions**: Are scores based on documented actions, not inferred from party/ideology?
5. **Logical Consistency**: Do the scores align with the cited evidence?

**Your Task:**
Review the assessment and respond with JSON ONLY:
{
  "approved": true/false,
  "issues": ["list of specific problems if any"],
  "suggestions": ["specific corrections if needed"]
}

CRITICAL: Return ONLY the JSON object, no additional commentary or explanation.`;

type Figure = {
  name: string;
  lifespan: string;
  spectrum: number[];
  timeline: Array<{
    label: string;
    spectrum: number[];
    note: string;
  }>;
};

type FiguresData = {
  featured: string[];
  figures: Figure[];
};

type AssessmentResult = {
  spectrum: number[];
  confidence: number;
  reasoning: string;
};

type ReviewResult = {
  approved: boolean;
  issues: string[];
  suggestions: string[];
};

async function getAssessment(name: string): Promise<AssessmentResult> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2048,
    system: ASSESSOR_PROMPT,
    messages: [
      {
        role: "user",
        content: `Provide a TAME-R assessment for: ${name}`,
      },
    ],
  });

  const textContent = response.content.find((block) => block.type === "text");
  let text = textContent && "text" in textContent ? textContent.text : "{}";

  // Strip markdown code fences if present
  text = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error(`Failed to parse assessment for ${name}:`, text);
    throw new Error(`Invalid JSON response for ${name}`);
  }
}

async function reviewAssessment(
  name: string,
  assessment: AssessmentResult
): Promise<ReviewResult> {
  const reviewPrompt = `Figure: ${name}\n\nAssessment:\nSpectrum: ${assessment.spectrum}\nConfidence: ${assessment.confidence}%\nReasoning: ${assessment.reasoning}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: REVIEWER_PROMPT,
    messages: [{ role: "user", content: reviewPrompt }],
  });

  const textContent = response.content.find((block) => block.type === "text");
  let text = textContent && "text" in textContent ? textContent.text : "{}";

  // Strip markdown code fences if present
  text = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();

  // Extract just the JSON object (everything from first { to last })
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    text = jsonMatch[0];
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error(`Failed to parse review for ${name}:`, text);
    throw new Error(`Invalid JSON response for review of ${name}`);
  }
}

async function verifyExistingFigure(
  figure: Figure,
  autoUpdate: boolean
): Promise<{ updated: boolean; newSpectrum?: number[] }> {
  console.log(`\n🔍 Verifying: ${figure.name}`);
  console.log(`   Current spectrum: [${figure.spectrum.join(", ")}]`);

  const assessment = await getAssessment(figure.name);
  console.log(`   AI assessment:    [${assessment.spectrum.join(", ")}]`);
  console.log(`   Confidence: ${assessment.confidence}%`);

  const review = await reviewAssessment(figure.name, assessment);

  if (!review.approved) {
    console.log(`   ⚠️  REVIEW ISSUES:`);
    review.issues.forEach((issue) => console.log(`      - ${issue}`));
    if (review.suggestions.length > 0) {
      console.log(`   💡 SUGGESTIONS:`);
      review.suggestions.forEach((suggestion) => console.log(`      - ${suggestion}`));
    }
  }

  // Check for significant differences
  const differences = figure.spectrum.map((val, idx) => Math.abs(val - assessment.spectrum[idx]));
  const maxDiff = Math.max(...differences);

  if (maxDiff >= 2) {
    console.log(`   ⚠️  LARGE DISCREPANCY (max diff: ${maxDiff})`);
    console.log(`   Reasoning: ${assessment.reasoning.substring(0, 300)}...`);
    
    if (autoUpdate && review.approved) {
      console.log(`   🔄 AUTO-UPDATING spectrum`);
      return { updated: true, newSpectrum: assessment.spectrum };
    }
  } else if (maxDiff >= 1) {
    console.log(`   ℹ️  Minor difference (max diff: ${maxDiff})`);
  } else {
    console.log(`   ✅ Matches existing data`);
  }

  return { updated: false };
}

async function addNewFigure(name: string): Promise<Figure | null> {
  console.log(`\n➕ Typing new figure: ${name}`);

  const assessment = await getAssessment(name);
  console.log(`   Spectrum: [${assessment.spectrum.join(", ")}]`);
  console.log(`   Confidence: ${assessment.confidence}%`);

  const review = await reviewAssessment(name, assessment);

  if (!review.approved) {
    console.log(`   ⚠️  REVIEW ISSUES:`);
    review.issues.forEach((issue) => console.log(`      - ${issue}`));
    console.log(`   ❌ Skipping due to review issues`);
    return null;
  }

  if (assessment.confidence < 50) {
    console.log(`   ❌ Confidence too low (${assessment.confidence}% < 50%)`);
    return null;
  }

  console.log(`   ✅ Approved for addition`);
  console.log(`   Reasoning: ${assessment.reasoning}`);

  // Create basic figure entry (user will need to add lifespan and timeline manually)
  return {
    name,
    lifespan: "NEEDS_LIFESPAN",
    spectrum: assessment.spectrum,
    timeline: [
      {
        label: "Overall Assessment",
        spectrum: assessment.spectrum,
        note: assessment.reasoning.substring(0, 200) + "...",
      },
    ],
  };
}

async function main() {
  const args = process.argv.slice(2);
  const flags = {
    verify: args.includes("--verify"),
    add: args.includes("--add"),
    update: args.includes("--update"),
  };

  if (!flags.verify && !flags.add) {
    console.log(`
Usage:
  npm run type-figures -- --verify                    # Verify existing figures
  npm run type-figures -- --verify --update           # Verify and auto-update large discrepancies
  npm run type-figures -- --add "Name1" "Name2"       # Add new figures
  npm run type-figures -- --verify --add "Name"       # Both

Examples:
  npm run type-figures -- --verify
  npm run type-figures -- --verify --update
  npm run type-figures -- --add "Taylor Swift" "Elon Musk"
    `);
    process.exit(1);
  }

  const figuresPath = path.join(process.cwd(), "data", "figures.json");
  const figuresData: FiguresData = JSON.parse(fs.readFileSync(figuresPath, "utf-8"));

  if (flags.verify) {
    console.log("🔍 VERIFYING EXISTING FIGURES\n");
    console.log(`Total figures: ${figuresData.figures.length}\n`);
    if (flags.update) {
      console.log("⚠️  AUTO-UPDATE MODE: Large discrepancies with approved reviews will be updated\n");
    }

    let updatedCount = 0;

    for (const figure of figuresData.figures) {
      const result = await verifyExistingFigure(figure, flags.update);
      if (result.updated && result.newSpectrum) {
        figure.spectrum = result.newSpectrum;
        updatedCount++;
      }
      // Rate limit to avoid API throttling
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (flags.update && updatedCount > 0) {
      console.log(`\n📝 Updating ${updatedCount} figure(s) in data/figures.json`);
      fs.writeFileSync(figuresPath, JSON.stringify(figuresData, null, 2));
      console.log("✅ Updated data/figures.json");
    }
  }

  if (flags.add) {
    const namesToAdd = args.filter((arg) => !arg.startsWith("--"));

    if (namesToAdd.length === 0) {
      console.error("❌ No names provided for --add flag");
      process.exit(1);
    }

    console.log("\n➕ ADDING NEW FIGURES\n");

    const newFigures: Figure[] = [];

    for (const name of namesToAdd) {
      const figure = await addNewFigure(name);
      if (figure) {
        newFigures.push(figure);
      }
      // Rate limit
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (newFigures.length > 0) {
      console.log(`\n📝 Adding ${newFigures.length} new figure(s) to data/figures.json`);

      figuresData.figures.push(...newFigures);

      fs.writeFileSync(figuresPath, JSON.stringify(figuresData, null, 2));

      console.log("✅ Updated data/figures.json");
      console.log("\n⚠️  MANUAL STEPS REQUIRED:");
      console.log("   1. Update 'lifespan' fields (currently 'NEEDS_LIFESPAN')");
      console.log("   2. Expand timeline entries with specific periods");
      console.log("   3. Review and refine the generated notes");
    }
  }

  console.log("\n✨ Done!\n");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
