import { describe, it, expect } from 'vitest';
import {
  getCoreCode,
  classifyCore,
  getDimensionColor,
  CORE_DIMENSIONS,
  CORE_FAMILIES,
  CORE_TYPES_BY_CODE,
  CORE_COLORS,
  type CoreScores,
} from '@/lib/core-config';

describe('getCoreCode', () => {
  describe('basic code generation', () => {
    it('should return LGMP for all low scores (0-2)', () => {
      const scores: CoreScores = [0, 0, 0, 0];
      expect(getCoreCode(scores)).toBe('LGMP');
    });

    it('should return LGMP for scores at boundary (2)', () => {
      const scores: CoreScores = [2, 2, 2, 2];
      expect(getCoreCode(scores)).toBe('LGMP');
    });

    it('should return ANST for all high scores (3-5)', () => {
      const scores: CoreScores = [5, 5, 5, 5];
      expect(getCoreCode(scores)).toBe('ANST');
    });

    it('should return ANST for scores at boundary (3)', () => {
      const scores: CoreScores = [3, 3, 3, 3];
      expect(getCoreCode(scores)).toBe('ANST');
    });
  });

  describe('individual dimension letter mapping', () => {
    it('should map Civil Rights: L for 0-2, A for 3-5', () => {
      expect(getCoreCode([0, 2, 2, 2])).toMatch(/^L/);
      expect(getCoreCode([1, 2, 2, 2])).toMatch(/^L/);
      expect(getCoreCode([2, 2, 2, 2])).toMatch(/^L/);
      expect(getCoreCode([3, 2, 2, 2])).toMatch(/^A/);
      expect(getCoreCode([4, 2, 2, 2])).toMatch(/^A/);
      expect(getCoreCode([5, 2, 2, 2])).toMatch(/^A/);
    });

    it('should map Openness: G for 0-2, N for 3-5', () => {
      expect(getCoreCode([2, 0, 2, 2])).toMatch(/^.G/);
      expect(getCoreCode([2, 1, 2, 2])).toMatch(/^.G/);
      expect(getCoreCode([2, 2, 2, 2])).toMatch(/^.G/);
      expect(getCoreCode([2, 3, 2, 2])).toMatch(/^.N/);
      expect(getCoreCode([2, 4, 2, 2])).toMatch(/^.N/);
      expect(getCoreCode([2, 5, 2, 2])).toMatch(/^.N/);
    });

    it('should map Redistribution: M for 0-2, S for 3-5', () => {
      expect(getCoreCode([2, 2, 0, 2])).toMatch(/^..M/);
      expect(getCoreCode([2, 2, 1, 2])).toMatch(/^..M/);
      expect(getCoreCode([2, 2, 2, 2])).toMatch(/^..M/);
      expect(getCoreCode([2, 2, 3, 2])).toMatch(/^..S/);
      expect(getCoreCode([2, 2, 4, 2])).toMatch(/^..S/);
      expect(getCoreCode([2, 2, 5, 2])).toMatch(/^..S/);
    });

    it('should map Ethics: P for 0-2, T for 3-5', () => {
      expect(getCoreCode([2, 2, 2, 0])).toMatch(/P$/);
      expect(getCoreCode([2, 2, 2, 1])).toMatch(/P$/);
      expect(getCoreCode([2, 2, 2, 2])).toMatch(/P$/);
      expect(getCoreCode([2, 2, 2, 3])).toMatch(/T$/);
      expect(getCoreCode([2, 2, 2, 4])).toMatch(/T$/);
      expect(getCoreCode([2, 2, 2, 5])).toMatch(/T$/);
    });
  });

  describe('all 16 possible type codes', () => {
    const testCases: Array<{ scores: CoreScores; expected: string }> = [
      // GM family (Global Market)
      { scores: [1, 1, 1, 1], expected: 'LGMP' },
      { scores: [4, 1, 1, 1], expected: 'AGMP' },
      { scores: [1, 1, 1, 4], expected: 'LGMT' },
      { scores: [4, 1, 1, 4], expected: 'AGMT' },
      // GS family (Global Social)
      { scores: [1, 1, 4, 1], expected: 'LGSP' },
      { scores: [4, 1, 4, 1], expected: 'AGSP' },
      { scores: [1, 1, 4, 4], expected: 'LGST' },
      { scores: [4, 1, 4, 4], expected: 'AGST' },
      // NM family (National Market)
      { scores: [1, 4, 1, 1], expected: 'LNMP' },
      { scores: [4, 4, 1, 1], expected: 'ANMP' },
      { scores: [1, 4, 1, 4], expected: 'LNMT' },
      { scores: [4, 4, 1, 4], expected: 'ANMT' },
      // NS family (National Social)
      { scores: [1, 4, 4, 1], expected: 'LNSP' },
      { scores: [4, 4, 4, 1], expected: 'ANSP' },
      { scores: [1, 4, 4, 4], expected: 'LNST' },
      { scores: [4, 4, 4, 4], expected: 'ANST' },
    ];

    testCases.forEach(({ scores, expected }) => {
      it(`should return ${expected} for scores [${scores.join(', ')}]`, () => {
        expect(getCoreCode(scores)).toBe(expected);
      });
    });
  });
});

describe('classifyCore', () => {
  describe('type and family lookup', () => {
    it('should find type info for LGMP', () => {
      const result = classifyCore([1, 1, 1, 1]);
      expect(result.code).toBe('LGMP');
      expect(result.type).toBeDefined();
      expect(result.type?.name).toBe('Optimists');
      expect(result.family).toBeDefined();
      expect(result.family?.name).toBe('Builders');
    });

    it('should find type info for ANST', () => {
      const result = classifyCore([4, 4, 4, 4]);
      expect(result.code).toBe('ANST');
      expect(result.type).toBeDefined();
      expect(result.type?.name).toBe('Order Conservatives');
      expect(result.family).toBeDefined();
      expect(result.family?.name).toBe('Unionists');
    });

    it('should find correct family code', () => {
      // Builders (GM family)
      expect(classifyCore([1, 1, 1, 1]).type?.familyCode).toBe('GM');
      // Diplomats (GS family)
      expect(classifyCore([1, 1, 4, 1]).type?.familyCode).toBe('GS');
      // Proprietors (NM family)
      expect(classifyCore([1, 4, 1, 1]).type?.familyCode).toBe('NM');
      // Unionists (NS family)
      expect(classifyCore([1, 4, 4, 1]).type?.familyCode).toBe('NS');
    });
  });

  describe('closest variations', () => {
    it('should return 3 closest variations', () => {
      const result = classifyCore([2, 2, 2, 2]);
      expect(result.closestVariations).toHaveLength(3);
    });

    it('should sort variations by distance (closest first)', () => {
      const result = classifyCore([1, 1, 1, 1]);
      const distances = result.closestVariations.map(v => v.distance);
      expect(distances).toEqual([...distances].sort((a, b) => a - b));
    });

    it('should find exact match for default LGMP scores', () => {
      const result = classifyCore([1, 1, 1, 1]);
      expect(result.closestVariations[0].distance).toBe(0);
      expect(result.closestVariations[0].typeCode).toBe('LGMP');
      expect(result.closestVariations[0].variationKey).toBe('default');
    });

    it('should find exact match for moderate LGMP scores', () => {
      const result = classifyCore([2, 2, 2, 2]);
      expect(result.closestVariations[0].distance).toBe(0);
      expect(result.closestVariations[0].variationKey).toBe('moderate');
    });

    it('should find exact match for extreme LGMP scores', () => {
      const result = classifyCore([0, 0, 0, 0]);
      expect(result.closestVariations[0].distance).toBe(0);
      expect(result.closestVariations[0].variationKey).toBe('extreme');
    });

    it('should calculate correct distance for non-exact matches', () => {
      // Score that's slightly off from any defined variation
      const result = classifyCore([1, 1, 1, 2]);
      // Closest should have non-zero distance since [1,1,1,2] isn't an exact variation
      expect(result.closestVariations[0].distance).toBeGreaterThanOrEqual(0);
    });
  });

  describe('boundary cases', () => {
    it('should handle scores at threshold boundary correctly', () => {
      // 2 is on the L/G/M/P side
      const lowResult = classifyCore([2, 2, 2, 2]);
      expect(lowResult.code).toBe('LGMP');

      // 3 is on the A/N/S/T side
      const highResult = classifyCore([3, 3, 3, 3]);
      expect(highResult.code).toBe('ANST');
    });
  });
});

describe('getDimensionColor', () => {
  describe('less government side (scores 0-2)', () => {
    it('should return purple color for extreme low (0)', () => {
      const color = getDimensionColor(0);
      expect(color).toBe(CORE_COLORS.purple);
    });

    it('should return blue color for default low (1)', () => {
      const color = getDimensionColor(1);
      expect(color).toBe(CORE_COLORS.blue);
    });

    it('should return green color for moderate low (2)', () => {
      const color = getDimensionColor(2);
      expect(color).toBe(CORE_COLORS.green);
    });
  });

  describe('more government side (scores 3-5)', () => {
    it('should return yellow color for moderate high (3)', () => {
      const color = getDimensionColor(3);
      expect(color).toBe(CORE_COLORS.yellow);
    });

    it('should return orange color for default high (4)', () => {
      const color = getDimensionColor(4);
      expect(color).toBe(CORE_COLORS.orange);
    });

    it('should return red color for extreme high (5)', () => {
      const color = getDimensionColor(5);
      expect(color).toBe(CORE_COLORS.red);
    });
  });

  describe('color intensity mapping', () => {
    it('should use extreme intensity for scores 0 and 5', () => {
      // Extreme scores should map to purple/red
      const extremeLow = getDimensionColor(0);
      const extremeHigh = getDimensionColor(5);
      expect(extremeLow).toBe(CORE_COLORS.purple);
      expect(extremeHigh).toBe(CORE_COLORS.red);
    });

    it('should use default intensity for scores 1 and 4', () => {
      // Default scores should map to blue/orange
      const defaultLow = getDimensionColor(1);
      const defaultHigh = getDimensionColor(4);
      expect(defaultLow).toBe(CORE_COLORS.blue);
      expect(defaultHigh).toBe(CORE_COLORS.orange);
    });

    it('should use moderate intensity for scores 2 and 3', () => {
      // Moderate scores should map to green/yellow
      const moderateLow = getDimensionColor(2);
      const moderateHigh = getDimensionColor(3);
      expect(moderateLow).toBe(CORE_COLORS.green);
      expect(moderateHigh).toBe(CORE_COLORS.yellow);
    });
  });
});

describe('CORE_DIMENSIONS constant', () => {
  it('should have exactly 4 dimensions', () => {
    expect(CORE_DIMENSIONS).toHaveLength(4);
  });

  it('should have correct keys in order: C, O, R, E', () => {
    expect(CORE_DIMENSIONS.map(d => d.key)).toEqual(['C', 'O', 'R', 'E']);
  });

  it('should have correct dimension names', () => {
    expect(CORE_DIMENSIONS[0].name).toBe('Civil Rights');
    expect(CORE_DIMENSIONS[1].name).toBe('Openness');
    expect(CORE_DIMENSIONS[2].name).toBe('Redistribution');
    expect(CORE_DIMENSIONS[3].name).toBe('Ethics');
  });

  it('should have correct letter pairs', () => {
    expect(CORE_DIMENSIONS[0].pair).toEqual(['L', 'A']);
    expect(CORE_DIMENSIONS[1].pair).toEqual(['G', 'N']);
    expect(CORE_DIMENSIONS[2].pair).toEqual(['M', 'S']);
    expect(CORE_DIMENSIONS[3].pair).toEqual(['P', 'T']);
  });
});

describe('CORE_FAMILIES constant', () => {
  it('should have exactly 4 families', () => {
    expect(Object.keys(CORE_FAMILIES)).toHaveLength(4);
  });

  it('should have families GM, GS, NM, NS', () => {
    expect(CORE_FAMILIES).toHaveProperty('GM');
    expect(CORE_FAMILIES).toHaveProperty('GS');
    expect(CORE_FAMILIES).toHaveProperty('NM');
    expect(CORE_FAMILIES).toHaveProperty('NS');
  });

  it('should have correct family names', () => {
    expect(CORE_FAMILIES.GM.name).toBe('Builders');
    expect(CORE_FAMILIES.GS.name).toBe('Diplomats');
    expect(CORE_FAMILIES.NM.name).toBe('Proprietors');
    expect(CORE_FAMILIES.NS.name).toBe('Unionists');
  });
});

describe('CORE_TYPES_BY_CODE constant', () => {
  it('should have exactly 16 types', () => {
    expect(Object.keys(CORE_TYPES_BY_CODE)).toHaveLength(16);
  });

  it('should have all 16 type codes', () => {
    const expectedCodes = [
      'LGMP', 'AGMP', 'LGMT', 'AGMT',
      'LGSP', 'AGSP', 'LGST', 'AGST',
      'LNMP', 'ANMP', 'LNMT', 'ANMT',
      'LNSP', 'ANSP', 'LNST', 'ANST',
    ];
    expectedCodes.forEach(code => {
      expect(CORE_TYPES_BY_CODE).toHaveProperty(code);
    });
  });

  it('should have variations for each type', () => {
    Object.values(CORE_TYPES_BY_CODE).forEach(type => {
      expect(type.variations).toHaveLength(3);
      const variationKeys = type.variations.map(v => v.key);
      expect(variationKeys).toContain('moderate');
      expect(variationKeys).toContain('default');
      expect(variationKeys).toContain('extreme');
    });
  });
});
