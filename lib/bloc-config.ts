// Bloc Configuration
// Loads bloc configuration from shared JSON file

import blocConfigData from '../analytics/bloc_config.json';

// Export the raw config data
export const CONFIG = blocConfigData;

// Type definitions
export type BlocId = keyof typeof CONFIG.blocNames;
export type ReferenceIdeologyId = keyof typeof CONFIG.referenceIdeologies;
export type AnyBlocId = BlocId | ReferenceIdeologyId;

export interface BlocPosition {
  examples: string;
  keyDimensions: string[];
  trade_score: number;
  abortion_score: number;
  migration_score: number;
  economics_score: number;
  rights_score: number;
}

export interface BlocColors {
  primary: string;
  secondary: string;
  accent: string;
  description: string;
}

// Export typed accessors
export const COLOR_RAMP = CONFIG.colorRamp;
export const BLOC_NAMES = CONFIG.blocNames;
export const REFERENCE_IDEOLOGIES = CONFIG.referenceIdeologies;
export const BLOC_DESCRIPTIONS = CONFIG.blocDescriptions;
export const DIMENSION_MEANINGS = CONFIG.dimensionMeanings;
export const IDEAL_BLOC_POSITIONS = CONFIG.idealBlocPositions as Record<AnyBlocId, BlocPosition>;
export const BLOC_COLORS = CONFIG.blocColors as Record<BlocId, BlocColors>;

// Create reverse mapping
const allNames = { ...BLOC_NAMES, ...REFERENCE_IDEOLOGIES };
export const BLOC_IDS: Record<string, AnyBlocId> = Object.entries(allNames).reduce(
  (acc, [id, name]) => ({ ...acc, [name]: id as AnyBlocId }),
  {}
);

// Helper functions
export function getBlocName(blocId: AnyBlocId): string {
  return allNames[blocId] ?? blocId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function getBlocId(blocName: string): AnyBlocId | undefined {
  return BLOC_IDS[blocName];
}

export function getIdealPosition(blocId: AnyBlocId, dimension?: string): number | Partial<BlocPosition> | undefined {
  const positions = IDEAL_BLOC_POSITIONS[blocId];
  if (!positions) return undefined;
  
  if (dimension) {
    return positions[dimension as keyof BlocPosition] as number;
  }
  
  // Return only the score dimensions
  return {
    trade_score: positions.trade_score,
    abortion_score: positions.abortion_score,
    migration_score: positions.migration_score,
    economics_score: positions.economics_score,
    rights_score: positions.rights_score,
  };
}

export function getKeyDimensions(blocId: AnyBlocId): string[] {
  return IDEAL_BLOC_POSITIONS[blocId]?.keyDimensions ?? [];
}

export function getBlocColors(blocId: BlocId): BlocColors {
  return BLOC_COLORS[blocId] ?? {
    primary: '#808080',
    secondary: '#808080',
    accent: '#808080',
    description: 'Gray - undefined bloc',
  };
}

export function getAllBlocs(includeReference = false): AnyBlocId[] {
  const blocs = Object.keys(BLOC_NAMES) as BlocId[];
  if (includeReference) {
    return [...blocs, ...Object.keys(REFERENCE_IDEOLOGIES)] as AnyBlocId[];
  }
  return blocs;
}

export function getBlocDescription(blocId: AnyBlocId): string {
  return BLOC_DESCRIPTIONS[blocId] ?? '';
}

export function getBlocExamples(blocId: AnyBlocId): string {
  return IDEAL_BLOC_POSITIONS[blocId]?.examples ?? '';
}
