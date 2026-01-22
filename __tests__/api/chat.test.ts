import { describe, it, expect } from 'vitest';
import { extractSpectrumData, EMOJI_TO_SCORE } from '@/lib/extract-spectrum-data';

describe('extractSpectrumData', () => {
  describe('valid CORE assessment with 4 dimensions', () => {
    it('should extract data from a standard assessment format', () => {
      const assessment = `Barack Obama 🟦🟦🟨🟦 (LGSP)
Civil Rights: 🟦 (civil libertarian) - Expanded civil liberties protections
Openness: 🟦 (free movement) - Supported trade agreements and international cooperation
Redistribution: 🟨 (social programs) - Advocated for healthcare reform and social safety net
Ethics: 🟦 (progressive reform) - Supported marriage equality and progressive social policies

Overall Confidence: 85%
Reasoning: Based on documented policy positions and legislative record during presidency.`;

      const result = extractSpectrumData(assessment);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Barack Obama');
      expect(result?.typeCode).toBe('LGSP');
      expect(result?.spectrum).toEqual([1, 1, 3, 1]);
      expect(result?.confidence).toBe(85);
      expect(result?.reasoning).toContain('documented policy positions');
    });

    it('should extract data with all maximum scores (🟥)', () => {
      const assessment = `Test Figure 🟥🟥🟥🟥 (ANST)
Civil Rights: 🟥 (police state) - Maximum authority
Openness: 🟥 (closed borders) - Complete isolation
Redistribution: 🟥 (planned economy) - Full state control
Ethics: 🟥 (enforce conformity) - Maximum traditionalism

Overall Confidence: 70%
Reasoning: Test reasoning.`;

      const result = extractSpectrumData(assessment);

      expect(result).not.toBeNull();
      expect(result?.spectrum).toEqual([5, 5, 5, 5]);
      expect(result?.typeCode).toBe('ANST');
    });

    it('should extract data with all minimum scores (🟪)', () => {
      const assessment = `Libertarian Figure 🟪🟪🟪🟪 (LGMP)
Civil Rights: 🟪 (abolish enforcement) - Minimal state constraint
Openness: 🟪 (open borders) - Complete global integration
Redistribution: 🟪 (pure capitalism) - Pure market allocation
Ethics: 🟪 (radical social change) - Maximum progressivism

Overall Confidence: 60%
Reasoning: Example reasoning.`;

      const result = extractSpectrumData(assessment);

      expect(result).not.toBeNull();
      expect(result?.spectrum).toEqual([0, 0, 0, 0]);
      expect(result?.typeCode).toBe('LGMP');
    });

    it('should handle mixed scores across the spectrum', () => {
      const assessment = `Mixed Position 🟩🟧🟦🟨 (LGMP)
Civil Rights: 🟩 (privacy protections) - Moderate liberty
Openness: 🟧 (strict border security) - Strong national focus
Redistribution: 🟦 (free markets) - Market-leaning economy
Ethics: 🟨 (preserve traditions) - Traditional values

Overall Confidence: 75%
Reasoning: Demonstrates mixed political positions.`;

      const result = extractSpectrumData(assessment);

      expect(result).not.toBeNull();
      expect(result?.spectrum).toEqual([2, 4, 1, 3]);
    });
  });

  describe('assessment with markdown formatting', () => {
    it('should handle markdown heading with hash', () => {
      const assessment = `# Joe Biden 🟦🟦🟨🟦 (LGSP)
**Civil Rights:** 🟦 (civil libertarian) - Civil rights focus
**Openness:** 🟦 (free movement) - International cooperation
**Redistribution:** 🟨 (social programs) - Social spending priorities
**Ethics:** 🟦 (progressive reform) - Progressive social policies

Overall Confidence: 80%
Reasoning: Based on presidential record.`;

      const result = extractSpectrumData(assessment);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Joe Biden');
      expect(result?.spectrum).toEqual([1, 1, 3, 1]);
      expect(result?.typeCode).toBe('LGSP');
    });

    it('should handle bold dimension labels', () => {
      const assessment = `Test Person 🟩🟩🟩🟩 (LGMP)
**Civil Rights:** 🟩 (privacy protections) - Explanation
**Openness:** 🟩 (trade agreements) - Explanation
**Redistribution:** 🟩 (mixed economy) - Explanation
**Ethics:** 🟩 (incremental progress) - Explanation

Overall Confidence: 65%
Reasoning: Test.`;

      const result = extractSpectrumData(assessment);

      expect(result).not.toBeNull();
      expect(result?.spectrum).toEqual([2, 2, 2, 2]);
    });
  });

  describe('assessment with missing dimensions', () => {
    it('should return null when only 3 dimensions are present', () => {
      const assessment = `Incomplete Figure 🟦🟦🟦 (LGSP)
Civil Rights: 🟦 (civil libertarian) - Explanation
Openness: 🟦 (free movement) - Explanation
Redistribution: 🟦 (free markets) - Explanation

Overall Confidence: 50%
Reasoning: Missing ethics dimension.`;

      const result = extractSpectrumData(assessment);

      expect(result).toBeNull();
    });

    it('should return null when no dimensions are present', () => {
      const assessment = `This is just a text response without any CORE assessment data.
It talks about political positions but doesn't include the structured format.`;

      const result = extractSpectrumData(assessment);

      expect(result).toBeNull();
    });

    it('should return null when type code is missing from header', () => {
      const assessment = `Figure Without Code 🟦🟦🟦🟦
Civil Rights: 🟦 (civil libertarian) - Explanation
Openness: 🟦 (free movement) - Explanation
Redistribution: 🟦 (free markets) - Explanation
Ethics: 🟦 (progressive reform) - Explanation

Overall Confidence: 70%
Reasoning: Has dimensions but no type code in parentheses.`;

      const result = extractSpectrumData(assessment);

      expect(result).toBeNull();
    });
  });

  describe('assessment with unknown (white square) emojis', () => {
    it('should map white squares to null values', () => {
      const assessment = `Unclear Figure 🟦⬜🟨⬜ (LGSP)
Civil Rights: 🟦 (civil libertarian) - Has clear record
Openness: ⬜ (Unknown) - Insufficient evidence on trade/immigration
Redistribution: 🟨 (social programs) - Documented spending record
Ethics: ⬜ (Unknown) - No clear social policy positions

Overall Confidence: 45%
Reasoning: Limited evidence for some dimensions.`;

      const result = extractSpectrumData(assessment);

      expect(result).not.toBeNull();
      expect(result?.spectrum).toEqual([1, null, 3, null]);
    });

    it('should handle all unknown dimensions', () => {
      const assessment = `Mystery Figure ⬜⬜⬜⬜ (LGMP)
Civil Rights: ⬜ (Unknown) - No evidence
Openness: ⬜ (Unknown) - No evidence
Redistribution: ⬜ (Unknown) - No evidence
Ethics: ⬜ (Unknown) - No evidence

Overall Confidence: 10%
Reasoning: Insufficient data for any dimension.`;

      const result = extractSpectrumData(assessment);

      expect(result).not.toBeNull();
      expect(result?.spectrum).toEqual([null, null, null, null]);
    });
  });

  describe('confidence extraction', () => {
    it('should extract confidence percentage correctly', () => {
      const assessment = `Test 🟦🟦🟦🟦 (LGMP)
Civil Rights: 🟦 - Test
Openness: 🟦 - Test
Redistribution: 🟦 - Test
Ethics: 🟦 - Test

Overall Confidence: 92%
Reasoning: High confidence.`;

      const result = extractSpectrumData(assessment);

      expect(result?.confidence).toBe(92);
    });

    it('should handle missing confidence gracefully', () => {
      const assessment = `Test 🟦🟦🟦🟦 (LGMP)
Civil Rights: 🟦 - Test
Openness: 🟦 - Test
Redistribution: 🟦 - Test
Ethics: 🟦 - Test

Reasoning: No confidence percentage included.`;

      const result = extractSpectrumData(assessment);

      expect(result).not.toBeNull();
      expect(result?.confidence).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle extra whitespace in name', () => {
      const assessment = `   George Washington   🟦🟩🟦🟨 (LGMT)
Civil Rights: 🟦 (civil libertarian) - Explanation
Openness: 🟩 (trade agreements) - Explanation
Redistribution: 🟦 (free markets) - Explanation
Ethics: 🟨 (preserve traditions) - Explanation

Overall Confidence: 40%
Reasoning: Historical figure.`;

      const result = extractSpectrumData(assessment);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('George Washington');
    });

    it('should handle names with special characters', () => {
      const assessment = `John O'Connor Jr. 🟦🟦🟦🟦 (LGMP)
Civil Rights: 🟦 - Test
Openness: 🟦 - Test
Redistribution: 🟦 - Test
Ethics: 🟦 - Test

Overall Confidence: 55%
Reasoning: Name with apostrophe.`;

      const result = extractSpectrumData(assessment);

      expect(result?.name).toBe("John O'Connor Jr.");
    });

    it('should handle empty string input', () => {
      const result = extractSpectrumData('');
      expect(result).toBeNull();
    });

    it('should handle malformed emoji sequences', () => {
      const assessment = `Bad Format 🟦🟦 (LGMP)
Civil Rights: 🟦 - Only two emojis in header
Some random text without proper format`;

      const result = extractSpectrumData(assessment);
      expect(result).toBeNull();
    });
  });
});

describe('EMOJI_TO_SCORE mapping', () => {
  it('should map purple to 0', () => {
    expect(EMOJI_TO_SCORE['🟪']).toBe(0);
  });

  it('should map blue to 1', () => {
    expect(EMOJI_TO_SCORE['🟦']).toBe(1);
  });

  it('should map green to 2', () => {
    expect(EMOJI_TO_SCORE['🟩']).toBe(2);
  });

  it('should map yellow to 3', () => {
    expect(EMOJI_TO_SCORE['🟨']).toBe(3);
  });

  it('should map orange to 4', () => {
    expect(EMOJI_TO_SCORE['🟧']).toBe(4);
  });

  it('should map red to 5', () => {
    expect(EMOJI_TO_SCORE['🟥']).toBe(5);
  });

  it('should map white to null (unknown)', () => {
    expect(EMOJI_TO_SCORE['⬜']).toBe(null);
  });

  it('should have exactly 7 emoji mappings', () => {
    expect(Object.keys(EMOJI_TO_SCORE)).toHaveLength(7);
  });
});
