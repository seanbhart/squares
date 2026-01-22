import { describe, it, expect } from 'vitest';
import {
  convertTamerToCore,
  convertTamerArrayToCore,
  getConversionConfidence,
  type TamerScores,
  type CoreScores,
} from '@/lib/tamer-to-core-converter';

describe('convertTamerToCore', () => {
  describe('basic conversion from 5-dimension TAMER to 4-dimension CORE', () => {
    it('should convert minimum TAMER scores (all 0s) to low CORE scores', () => {
      const tamer: TamerScores = {
        trade_score: 0,
        abortion_score: 0,
        migration_score: 0,
        economics_score: 0,
        rights_score: 0,
      };

      const result = convertTamerToCore(tamer);

      // All minimum values should map to 0
      expect(result.civil_rights_score).toBe(0);
      expect(result.openness_score).toBe(0);
      expect(result.redistribution_score).toBe(0);
      expect(result.ethics_score).toBe(0);
    });

    it('should convert maximum TAMER scores (all 6s) to high CORE scores', () => {
      const tamer: TamerScores = {
        trade_score: 6,
        abortion_score: 6,
        migration_score: 6,
        economics_score: 6,
        rights_score: 6,
      };

      const result = convertTamerToCore(tamer);

      // All maximum values should map to 5
      expect(result.civil_rights_score).toBe(5);
      expect(result.openness_score).toBe(5);
      expect(result.redistribution_score).toBe(5);
      expect(result.ethics_score).toBe(5);
    });

    it('should convert middle TAMER scores (all 3s) to middle CORE scores', () => {
      const tamer: TamerScores = {
        trade_score: 3,
        abortion_score: 3,
        migration_score: 3,
        economics_score: 3,
        rights_score: 3,
      };

      const result = convertTamerToCore(tamer);

      // Middle values (3 on 0-6 scale) should map close to middle (2-3 on 0-5 scale)
      // 3/6 * 5 = 2.5, rounds to 2 or 3
      expect(result.civil_rights_score).toBeGreaterThanOrEqual(2);
      expect(result.civil_rights_score).toBeLessThanOrEqual(3);
    });
  });

  describe('Civil Rights dimension calculation', () => {
    // Civil Rights = average(rights, abortion) scaled from 0-6 to 0-5
    it('should calculate Civil Rights from rights and abortion scores', () => {
      const tamer: TamerScores = {
        trade_score: 3,
        abortion_score: 6, // High
        migration_score: 3,
        economics_score: 3,
        rights_score: 6, // High
      };

      const result = convertTamerToCore(tamer);

      // (6 + 6) / 2 = 6, scaled to 5
      expect(result.civil_rights_score).toBe(5);
    });

    it('should average rights and abortion correctly', () => {
      const tamer: TamerScores = {
        trade_score: 3,
        abortion_score: 0, // Low
        migration_score: 3,
        economics_score: 3,
        rights_score: 6, // High
      };

      const result = convertTamerToCore(tamer);

      // (0 + 6) / 2 = 3, scaled from 0-6 to 0-5: 3/6*5 = 2.5, rounds to 2 or 3
      expect(result.civil_rights_score).toBeGreaterThanOrEqual(2);
      expect(result.civil_rights_score).toBeLessThanOrEqual(3);
    });
  });

  describe('Openness dimension calculation', () => {
    // Openness = average(migration, trade) scaled from 0-6 to 0-5
    it('should calculate Openness from migration and trade scores', () => {
      const tamer: TamerScores = {
        trade_score: 6, // High (protectionism)
        abortion_score: 3,
        migration_score: 6, // High (closed borders)
        economics_score: 3,
        rights_score: 3,
      };

      const result = convertTamerToCore(tamer);

      // (6 + 6) / 2 = 6, scaled to 5
      expect(result.openness_score).toBe(5);
    });

    it('should handle mixed trade and migration values', () => {
      const tamer: TamerScores = {
        trade_score: 0, // Free trade
        abortion_score: 3,
        migration_score: 6, // Closed borders
        economics_score: 3,
        rights_score: 3,
      };

      const result = convertTamerToCore(tamer);

      // (0 + 6) / 2 = 3, scaled: 3/6*5 = 2.5
      expect(result.openness_score).toBeGreaterThanOrEqual(2);
      expect(result.openness_score).toBeLessThanOrEqual(3);
    });
  });

  describe('Redistribution dimension calculation', () => {
    // Redistribution = economics_score scaled from 0-6 to 0-5
    it('should calculate Redistribution directly from economics score', () => {
      const tamer: TamerScores = {
        trade_score: 3,
        abortion_score: 3,
        migration_score: 3,
        economics_score: 6, // State control
        rights_score: 3,
      };

      const result = convertTamerToCore(tamer);

      // 6 scaled from 0-6 to 0-5 = 5
      expect(result.redistribution_score).toBe(5);
    });

    it('should map low economics to low redistribution', () => {
      const tamer: TamerScores = {
        trade_score: 3,
        abortion_score: 3,
        migration_score: 3,
        economics_score: 0, // Free market
        rights_score: 3,
      };

      const result = convertTamerToCore(tamer);

      expect(result.redistribution_score).toBe(0);
    });
  });

  describe('Ethics dimension calculation', () => {
    // Ethics = weighted average (abortion * 0.6 + rights * 0.4) scaled from 0-6 to 0-5
    it('should calculate Ethics with weighted abortion and rights', () => {
      const tamer: TamerScores = {
        trade_score: 3,
        abortion_score: 6, // Traditional (ban)
        migration_score: 3,
        economics_score: 3,
        rights_score: 6, // Traditional (criminalization)
      };

      const result = convertTamerToCore(tamer);

      // (6 * 0.6 + 6 * 0.4) = 6, scaled to 5
      expect(result.ethics_score).toBe(5);
    });

    it('should weight abortion higher than rights in ethics calculation', () => {
      const tamer: TamerScores = {
        trade_score: 3,
        abortion_score: 6, // High
        migration_score: 3,
        economics_score: 3,
        rights_score: 0, // Low
      };

      const result = convertTamerToCore(tamer);

      // (6 * 0.6 + 0 * 0.4) = 3.6, scaled: 3.6/6*5 = 3
      expect(result.ethics_score).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle values above maximum (clamp to 6)', () => {
      const tamer: TamerScores = {
        trade_score: 10, // Above max
        abortion_score: 10,
        migration_score: 10,
        economics_score: 10,
        rights_score: 10,
      };

      const result = convertTamerToCore(tamer);

      // Should clamp to 6 first, then scale to 5
      expect(result.civil_rights_score).toBe(5);
      expect(result.openness_score).toBe(5);
      expect(result.redistribution_score).toBe(5);
      expect(result.ethics_score).toBe(5);
    });

    it('should handle negative values (clamp to 0)', () => {
      const tamer: TamerScores = {
        trade_score: -5, // Below min
        abortion_score: -5,
        migration_score: -5,
        economics_score: -5,
        rights_score: -5,
      };

      const result = convertTamerToCore(tamer);

      // Should clamp to 0
      expect(result.civil_rights_score).toBe(0);
      expect(result.openness_score).toBe(0);
      expect(result.redistribution_score).toBe(0);
      expect(result.ethics_score).toBe(0);
    });

    it('should handle decimal values', () => {
      const tamer: TamerScores = {
        trade_score: 3.5,
        abortion_score: 3.5,
        migration_score: 3.5,
        economics_score: 3.5,
        rights_score: 3.5,
      };

      const result = convertTamerToCore(tamer);

      // Should work with decimals and round result
      expect(Number.isInteger(result.civil_rights_score)).toBe(true);
      expect(Number.isInteger(result.openness_score)).toBe(true);
      expect(Number.isInteger(result.redistribution_score)).toBe(true);
      expect(Number.isInteger(result.ethics_score)).toBe(true);
    });

    it('should return scores within valid 0-5 range', () => {
      // Test various combinations
      const testCases: TamerScores[] = [
        { trade_score: 0, abortion_score: 0, migration_score: 0, economics_score: 0, rights_score: 0 },
        { trade_score: 6, abortion_score: 6, migration_score: 6, economics_score: 6, rights_score: 6 },
        { trade_score: 1, abortion_score: 5, migration_score: 2, economics_score: 4, rights_score: 3 },
        { trade_score: 6, abortion_score: 0, migration_score: 3, economics_score: 3, rights_score: 6 },
      ];

      testCases.forEach(tamer => {
        const result = convertTamerToCore(tamer);

        expect(result.civil_rights_score).toBeGreaterThanOrEqual(0);
        expect(result.civil_rights_score).toBeLessThanOrEqual(5);
        expect(result.openness_score).toBeGreaterThanOrEqual(0);
        expect(result.openness_score).toBeLessThanOrEqual(5);
        expect(result.redistribution_score).toBeGreaterThanOrEqual(0);
        expect(result.redistribution_score).toBeLessThanOrEqual(5);
        expect(result.ethics_score).toBeGreaterThanOrEqual(0);
        expect(result.ethics_score).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('scale conversion accuracy', () => {
    it('should correctly scale from 0-6 to 0-5 range', () => {
      // Test specific scaling points
      // 0 -> 0
      // 1 -> ~0.83 -> 1
      // 2 -> ~1.67 -> 2
      // 3 -> 2.5 -> 2 or 3
      // 4 -> ~3.33 -> 3
      // 5 -> ~4.17 -> 4
      // 6 -> 5

      const mappings = [
        { input: 0, expectedMin: 0, expectedMax: 0 },
        { input: 1, expectedMin: 1, expectedMax: 1 },
        { input: 2, expectedMin: 1, expectedMax: 2 },
        { input: 3, expectedMin: 2, expectedMax: 3 },
        { input: 4, expectedMin: 3, expectedMax: 4 },
        { input: 5, expectedMin: 4, expectedMax: 4 },
        { input: 6, expectedMin: 5, expectedMax: 5 },
      ];

      mappings.forEach(({ input, expectedMin, expectedMax }) => {
        const tamer: TamerScores = {
          trade_score: 3,
          abortion_score: 3,
          migration_score: 3,
          economics_score: input, // Using economics as it maps directly
          rights_score: 3,
        };

        const result = convertTamerToCore(tamer);

        expect(result.redistribution_score).toBeGreaterThanOrEqual(expectedMin);
        expect(result.redistribution_score).toBeLessThanOrEqual(expectedMax);
      });
    });
  });
});

describe('convertTamerArrayToCore', () => {
  it('should convert an array of TAMER scores', () => {
    const tamerArray: TamerScores[] = [
      { trade_score: 0, abortion_score: 0, migration_score: 0, economics_score: 0, rights_score: 0 },
      { trade_score: 6, abortion_score: 6, migration_score: 6, economics_score: 6, rights_score: 6 },
    ];

    const results = convertTamerArrayToCore(tamerArray);

    expect(results).toHaveLength(2);
    expect(results[0].civil_rights_score).toBe(0);
    expect(results[1].civil_rights_score).toBe(5);
  });

  it('should return empty array for empty input', () => {
    const results = convertTamerArrayToCore([]);
    expect(results).toHaveLength(0);
  });

  it('should preserve order of conversions', () => {
    const tamerArray: TamerScores[] = [
      { trade_score: 0, abortion_score: 0, migration_score: 0, economics_score: 0, rights_score: 0 },
      { trade_score: 3, abortion_score: 3, migration_score: 3, economics_score: 3, rights_score: 3 },
      { trade_score: 6, abortion_score: 6, migration_score: 6, economics_score: 6, rights_score: 6 },
    ];

    const results = convertTamerArrayToCore(tamerArray);

    expect(results[0].redistribution_score).toBeLessThan(results[1].redistribution_score);
    expect(results[1].redistribution_score).toBeLessThan(results[2].redistribution_score);
  });
});

describe('getConversionConfidence', () => {
  describe('high confidence scenarios', () => {
    it('should return high confidence when related dimensions align', () => {
      const tamer: TamerScores = {
        trade_score: 3,
        abortion_score: 3, // Same as rights
        migration_score: 3, // Same as trade
        economics_score: 3,
        rights_score: 3, // Same as abortion
      };

      const confidence = getConversionConfidence(tamer);

      // Perfect alignment should give high confidence
      expect(confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('should return 1.0 for perfectly aligned scores', () => {
      const tamer: TamerScores = {
        trade_score: 2,
        abortion_score: 4,
        migration_score: 2, // Matches trade
        economics_score: 3,
        rights_score: 4, // Matches abortion
      };

      const confidence = getConversionConfidence(tamer);

      expect(confidence).toBe(1);
    });
  });

  describe('low confidence scenarios', () => {
    it('should return low confidence when related dimensions diverge', () => {
      const tamer: TamerScores = {
        trade_score: 0,
        abortion_score: 0, // Opposite of rights
        migration_score: 6, // Opposite of trade
        economics_score: 3,
        rights_score: 6, // Opposite of abortion
      };

      const confidence = getConversionConfidence(tamer);

      // Maximum divergence should give low confidence
      expect(confidence).toBeLessThanOrEqual(0.5);
    });

    it('should return 0 for maximally divergent scores', () => {
      const tamer: TamerScores = {
        trade_score: 0,
        abortion_score: 6,
        migration_score: 6, // Max diff from trade (6)
        economics_score: 3,
        rights_score: 0, // Max diff from abortion (6)
      };

      const confidence = getConversionConfidence(tamer);

      expect(confidence).toBe(0);
    });
  });

  describe('confidence calculation', () => {
    it('should return value between 0 and 1', () => {
      const testCases: TamerScores[] = [
        { trade_score: 0, abortion_score: 0, migration_score: 0, economics_score: 0, rights_score: 0 },
        { trade_score: 6, abortion_score: 6, migration_score: 6, economics_score: 6, rights_score: 6 },
        { trade_score: 1, abortion_score: 5, migration_score: 2, economics_score: 4, rights_score: 3 },
        { trade_score: 0, abortion_score: 6, migration_score: 6, economics_score: 0, rights_score: 0 },
      ];

      testCases.forEach(tamer => {
        const confidence = getConversionConfidence(tamer);
        expect(confidence).toBeGreaterThanOrEqual(0);
        expect(confidence).toBeLessThanOrEqual(1);
      });
    });

    it('should factor in rights-abortion alignment', () => {
      // Same migration-trade, different rights-abortion alignment
      const aligned: TamerScores = {
        trade_score: 3,
        abortion_score: 3,
        migration_score: 3,
        economics_score: 3,
        rights_score: 3, // Same as abortion
      };

      const divergent: TamerScores = {
        trade_score: 3,
        abortion_score: 0,
        migration_score: 3,
        economics_score: 3,
        rights_score: 6, // Opposite of abortion
      };

      expect(getConversionConfidence(aligned)).toBeGreaterThan(getConversionConfidence(divergent));
    });

    it('should factor in migration-trade alignment', () => {
      // Same rights-abortion, different migration-trade alignment
      const aligned: TamerScores = {
        trade_score: 3,
        abortion_score: 3,
        migration_score: 3, // Same as trade
        economics_score: 3,
        rights_score: 3,
      };

      const divergent: TamerScores = {
        trade_score: 0,
        abortion_score: 3,
        migration_score: 6, // Opposite of trade
        economics_score: 3,
        rights_score: 3,
      };

      expect(getConversionConfidence(aligned)).toBeGreaterThan(getConversionConfidence(divergent));
    });
  });
});
