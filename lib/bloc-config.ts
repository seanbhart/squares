// CORE Framework Configuration
// Loads CORE (Civil Rights, Openness, Redistribution, Ethics) configuration from shared JSON file

import coreConfigData from '../analytics/bloc_config.json';

// Export the raw config data
export const CONFIG = coreConfigData;

// Type definitions for the 4-letter call sign system
export type TypeId = keyof typeof CONFIG.typeNames;
export type FamilyId = keyof typeof CONFIG.familyNames;
export type AxisId = keyof typeof CONFIG.axes;

// Call sign letters
export type CivilRightsLetter = 'L' | 'A';  // Liberty | Authority
export type OpennessLetter = 'G' | 'N';      // Global | National  
export type RedistributionLetter = 'M' | 'S'; // Market | Social
export type EthicsLetter = 'P' | 'T';        // Progressive | Traditional

export type CallSign = `${CivilRightsLetter}${OpennessLetter}${RedistributionLetter}${EthicsLetter}`;

export interface TypePosition {
  callSign: CallSign;
  family: FamilyId;
  examples: string;
  civil_rights_score: number;    // 0-6: Liberty to Authority
  openness_score: number;         // 0-6: Global to National
  redistribution_score: number;   // 0-6: Market to Social
  ethics_score: number;           // 0-6: Progressive to Traditional
}

export interface TypeColors {
  civilRights: string;
  openness: string;
  redistribution: string;
  ethics: string;
}

export interface AxisDefinition {
  name: string;
  shortName: string;
  lowPole: string;
  highPole: string;
  lowLabel: string;
  highLabel: string;
  description: string;
  icon: string;
}

// Export typed accessors
export const COLOR_RAMP = CONFIG.colorRamp;
export const AXIS_COLORS = CONFIG.axisColors;
export const TYPE_NAMES = CONFIG.typeNames;
export const FAMILY_NAMES = CONFIG.familyNames;
export const AXES = CONFIG.axes as Record<AxisId, AxisDefinition>;
export const TYPE_DESCRIPTIONS = CONFIG.typeDescriptions;
export const DIMENSION_MEANINGS = CONFIG.dimensionMeanings;
export const TYPE_POSITIONS = CONFIG.typePositions as Record<TypeId, TypePosition>;
export const TYPE_COLORS = CONFIG.typeColors as Record<TypeId, TypeColors>;

// Create reverse mapping for type names
export const TYPE_IDS: Record<string, TypeId> = Object.entries(TYPE_NAMES).reduce(
  (acc, [id, name]) => ({ ...acc, [name]: id as TypeId }),
  {}
);

// Helper functions for CORE framework

/**
 * Get the display name for a type
 */
export function getTypeName(typeId: TypeId): string {
  return TYPE_NAMES[typeId] ?? typeId.toUpperCase();
}

/**
 * Get type ID from display name
 */
export function getTypeId(typeName: string): TypeId | undefined {
  return TYPE_IDS[typeName];
}

/**
 * Get the position scores for a type
 */
export function getTypePosition(typeId: TypeId): TypePosition | undefined {
  return TYPE_POSITIONS[typeId];
}

/**
 * Get the colors for a type's four axes
 */
export function getTypeColors(typeId: TypeId): TypeColors | undefined {
  return TYPE_COLORS[typeId];
}

/**
 * Get all type IDs
 */
export function getAllTypes(): TypeId[] {
  return Object.keys(TYPE_NAMES) as TypeId[];
}

/**
 * Get all types in a specific family
 */
export function getTypesByFamily(familyId: FamilyId): TypeId[] {
  return getAllTypes().filter(typeId => TYPE_POSITIONS[typeId]?.family === familyId);
}

/**
 * Get type description
 */
export function getTypeDescription(typeId: TypeId): string {
  return TYPE_DESCRIPTIONS[typeId] ?? '';
}

/**
 * Get type examples
 */
export function getTypeExamples(typeId: TypeId): string {
  return TYPE_POSITIONS[typeId]?.examples ?? '';
}

/**
 * Generate call sign from scores
 * Scores are 0-6 where 0 = low pole (L/G/M/P), 6 = high pole (A/N/S/T)
 */
export function generateCallSign(
  civilRightsScore: number,
  opennessScore: number,
  redistributionScore: number,
  ethicsScore: number
): CallSign {
  const c: CivilRightsLetter = civilRightsScore < 3 ? 'L' : 'A';
  const o: OpennessLetter = opennessScore < 3 ? 'G' : 'N';
  const r: RedistributionLetter = redistributionScore < 3 ? 'M' : 'S';
  const e: EthicsLetter = ethicsScore < 3 ? 'P' : 'T';
  return `${c}${o}${r}${e}`;
}

/**
 * Get family from openness and redistribution letters
 */
export function getFamilyFromLetters(o: OpennessLetter, r: RedistributionLetter): FamilyId {
  if (o === 'G' && r === 'M') return 'builders';
  if (o === 'G' && r === 'S') return 'diplomats';
  if (o === 'N' && r === 'S') return 'unionists';
  if (o === 'N' && r === 'M') return 'proprietors';
  return 'builders'; // fallback
}

/**
 * Parse call sign into component letters
 */
export function parseCallSign(callSign: CallSign): {
  civilRights: CivilRightsLetter;
  openness: OpennessLetter;
  redistribution: RedistributionLetter;
  ethics: EthicsLetter;
} {
  return {
    civilRights: callSign[0] as CivilRightsLetter,
    openness: callSign[1] as OpennessLetter,
    redistribution: callSign[2] as RedistributionLetter,
    ethics: callSign[3] as EthicsLetter,
  };
}
