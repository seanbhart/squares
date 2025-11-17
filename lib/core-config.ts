// CORE configuration and helpers for the frontend
// Uses the shared analytics/type_config.json produced by the analytics pipeline

import typeConfig from '../analytics/type_config.json';

export type CoreDimensionKey = 'C' | 'O' | 'R' | 'E';
export type CoreScores = [number, number, number, number];

export interface CoreDimension {
  key: CoreDimensionKey;
  name: string;
  negativeLabel: string; // L/G/M/P side
  positiveLabel: string; // A/N/S/T side
  pair: [string, string];
  description: string;
}

export const CORE_DIMENSIONS: CoreDimension[] = [
  {
    key: 'C',
    name: 'Civil Rights',
    negativeLabel: 'Liberty',
    positiveLabel: 'Authority',
    pair: ['L', 'A'],
    description: 'Less state constraint vs more state constraint.',
  },
  {
    key: 'O',
    name: 'Openness',
    negativeLabel: 'Global',
    positiveLabel: 'National',
    pair: ['G', 'N'],
    description: 'Supranational integration vs national sovereignty.',
  },
  {
    key: 'R',
    name: 'Redistribution',
    negativeLabel: 'Market',
    positiveLabel: 'Social',
    pair: ['M', 'S'],
    description: 'Market allocation vs state redistribution.',
  },
  {
    key: 'E',
    name: 'Ethics',
    negativeLabel: 'Progressive',
    positiveLabel: 'Traditional',
    pair: ['P', 'T'],
    description: 'Change-seeking vs preservation-seeking.',
  },
];

// Cast JSON so we can traverse without over-typing everything
const CONFIG: any = typeConfig as any;
export const CORE_COLORS: Record<string, string> = CONFIG.colors ?? {};
const INTENSITY_COLORS: any = CONFIG.intensity_colors ?? {};
const GRID_POSITIONS: Record<string, any> = CONFIG.grid_positions?.positions ?? {};

export interface CoreFamilyInfo {
  code: string;
  name: string;
  description?: string;
}

export interface CoreVariationInfo {
  key: 'moderate' | 'default' | 'extreme';
  name: string;
  scores: CoreScores;
}

export interface CoreTypeInfo {
  code: string;
  name: string;
  familyCode: string;
  familyName: string;
  coreScores: CoreScores;
  variations: CoreVariationInfo[];
}

const CORE_FAMILIES: Record<string, CoreFamilyInfo> = {};
const CORE_TYPES_BY_CODE: Record<string, CoreTypeInfo> = {};

for (const [familyCode, familyValue] of Object.entries<any>(CONFIG.families ?? {})) {
  CORE_FAMILIES[familyCode] = {
    code: familyCode,
    name: familyValue.name,
    description: familyValue.description,
  };

  for (const [typeCode, typeValue] of Object.entries<any>(familyValue.types ?? {})) {
    const variations: CoreVariationInfo[] = Object.entries<any>(typeValue.variations ?? {}).map(
      ([key, value]) => ({
        key: key as CoreVariationInfo['key'],
        name: value.name,
        scores: value.scores as CoreScores,
      }),
    );

    CORE_TYPES_BY_CODE[typeCode] = {
      code: typeCode,
      name: typeValue.name,
      familyCode,
      familyName: familyValue.name,
      coreScores: typeValue.core_scores as CoreScores,
      variations,
    };
  }
}

export { CORE_FAMILIES, CORE_TYPES_BY_CODE };

export interface CoreVariationMatch {
  typeCode: string;
  typeName: string;
  familyCode: string;
  familyName: string;
  variationKey: CoreVariationInfo['key'];
  variationName: string;
  distance: number;
}

export interface CoreClassification {
  code: string; // e.g. LGMP
  type?: CoreTypeInfo;
  family?: CoreFamilyInfo;
  closestVariations: CoreVariationMatch[];
}

export function getCoreCode(scores: CoreScores): string {
  const letters = CORE_DIMENSIONS.map((dimension, index) => {
    const value = scores[index];
    const [negative, positive] = dimension.pair;
    return value <= 2 ? negative : positive;
  });
  return letters.join('');
}

export function classifyCore(scores: CoreScores): CoreClassification {
  const code = getCoreCode(scores);
  const type = CORE_TYPES_BY_CODE[code];
  const family = type ? CORE_FAMILIES[type.familyCode] : undefined;

  const matches: CoreVariationMatch[] = [];

  for (const t of Object.values(CORE_TYPES_BY_CODE)) {
    for (const variation of t.variations) {
      const distance = euclideanDistance(scores, variation.scores);
      matches.push({
        typeCode: t.code,
        typeName: t.name,
        familyCode: t.familyCode,
        familyName: t.familyName,
        variationKey: variation.key,
        variationName: variation.name,
        distance,
      });
    }
  }

  matches.sort((a, b) => a.distance - b.distance);

  return {
    code,
    type,
    family,
    closestVariations: matches.slice(0, 3),
  };
}

function euclideanDistance(a: CoreScores, b: CoreScores): number {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 +
      (a[1] - b[1]) ** 2 +
      (a[2] - b[2]) ** 2 +
      (a[3] - b[3]) ** 2,
  );
}

export interface GridCellData {
  key: string; // e.g. "1_0"
  row: number;
  col: number;
  background: string;
  label?: string;
  dimensionKey?: CoreDimensionKey;
}

export function getGridCellsForScores(scores: CoreScores, code?: string): GridCellData[] {
  const cells: GridCellData[] = [];

  const effectiveCode = code ?? getCoreCode(scores);
  const letters = effectiveCode.split('');

  const isLowSide = (axisIndex: number): boolean => {
    const [low] = CORE_DIMENSIONS[axisIndex].pair;
    const letter = letters[axisIndex];
    return letter === low;
  };

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const key = `${col}_${row}`;

      let background = CORE_COLORS.background ?? '#121113';
      let label: string | undefined;
      let dimensionKey: CoreDimensionKey | undefined;

      // Intensity squares (top-right 2x2): show individual color per dimension
      if (row === 0 && col === 1) {
        // Civil Rights (C)
        background = getDimensionColor(scores[0]);
        dimensionKey = 'C';
      } else if (row === 0 && col === 2) {
        // Openness (O)
        background = getDimensionColor(scores[1]);
        dimensionKey = 'O';
      } else if (row === 1 && col === 1) {
        // Redistribution (R)
        background = getDimensionColor(scores[2]);
        dimensionKey = 'R';
      } else if (row === 1 && col === 2) {
        // Ethics (E)
        background = getDimensionColor(scores[3]);
        dimensionKey = 'E';
      }

      // Binary type indicators (two on the left, two on the bottom)
      else if (row === 0 && col === 0) {
        // C axis binary
        background = isLowSide(0) ? CORE_COLORS.light ?? '#D9D9D9' : CORE_COLORS.dark ?? '#232323';
      } else if (row === 1 && col === 0) {
        // O axis binary
        background = isLowSide(1) ? CORE_COLORS.light ?? '#D9D9D9' : CORE_COLORS.dark ?? '#232323';
      } else if (row === 2 && col === 1) {
        // R axis binary
        background = isLowSide(2) ? CORE_COLORS.light ?? '#D9D9D9' : CORE_COLORS.dark ?? '#232323';
      } else if (row === 2 && col === 2) {
        // E axis binary
        background = isLowSide(3) ? CORE_COLORS.light ?? '#D9D9D9' : CORE_COLORS.dark ?? '#232323';
      }

      // Special indicator cell (bottom-left dashed box)
      else if (row === 2 && col === 0) {
        label = 'indicator';
        background = CORE_COLORS.dark ?? '#232323';
      }

      cells.push({ key, row, col, background, label, dimensionKey });
    }
  }

  // Already iterated row-major, but keep sort for safety
  cells.sort((a, b) => (a.row === b.row ? a.col - b.col : a.row - b.row));

  return cells;
}

export function getDimensionColor(score: number): string {
  const sideKey = score <= 2 ? 'less_government' : 'more_government';

  let intensityKey: 'moderate' | 'default' | 'extreme';
  if (score === 0 || score === 5) {
    intensityKey = 'extreme';
  } else if (score === 1 || score === 4) {
    intensityKey = 'default';
  } else {
    intensityKey = 'moderate';
  }

  const intensity = INTENSITY_COLORS[intensityKey] ?? {};
  const colorName = intensity[sideKey];

  if (colorName && CORE_COLORS[colorName]) {
    return CORE_COLORS[colorName];
  }

  // Fallbacks
  if (sideKey === 'less_government') {
    return CORE_COLORS.blue ?? '#1F6ADB';
  }
  return CORE_COLORS.orange ?? '#E67E22';
}
