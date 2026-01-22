/**
 * Extracts CORE spectrum data from an assessment text response.
 *
 * Parses the AI-generated assessment text to extract:
 * - Name of the assessed entity
 * - 4-dimension spectrum scores (C, O, R, E)
 * - Type code (4-letter code like LGMP)
 * - Confidence percentage
 * - Reasoning text
 */

export interface ExtractedSpectrumData {
  name?: string;
  spectrum?: (number | null)[];
  typeCode?: string;
  confidence?: number;
  reasoning?: string;
}

/**
 * Maps emoji squares to their corresponding CORE scores.
 * CORE uses a 0-5 scale where:
 * - Purple (0): Most liberty/progressive/global/market
 * - Red (5): Most authority/traditional/national/social
 * - White: Unknown/insufficient evidence
 */
export const EMOJI_TO_SCORE: Record<string, number | null> = {
  '🟪': 0,
  '🟦': 1,
  '🟩': 2,
  '🟨': 3,
  '🟧': 4,
  '🟥': 5,
  '⬜': null,
};

/**
 * Extract spectrum data from assessment text.
 *
 * @param assessment - The full assessment text from the AI
 * @returns Extracted data or null if parsing fails
 */
export function extractSpectrumData(assessment: string): ExtractedSpectrumData | null {
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
        if (emoji && emoji in EMOJI_TO_SCORE) {
          spectrum.push(EMOJI_TO_SCORE[emoji]);
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
