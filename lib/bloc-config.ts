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

export interface SubTypeVariation {
  name: string;
  singularName?: string;
  intensity: number;              // 1=moderate, 2=medium, 3=extreme
  civil_rights_score: number;     // 0-5: Liberty to Authority
  openness_score: number;          // 0-5: Global to National
  redistribution_score: number;    // 0-5: Market to Social
  ethics_score: number;            // 0-5: Progressive to Traditional
}

export interface TypePosition {
  callSign: CallSign;
  family: FamilyId;
  examples: string;
  civil_rights_score: number;    // 0-5: Liberty to Authority
  openness_score: number;         // 0-5: Global to National
  redistribution_score: number;   // 0-5: Market to Social
  ethics_score: number;           // 0-5: Progressive to Traditional
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
  question: string;
  values: [string, string, string, string, string, string]; // 6 descriptors from 0-5
}

// Override colors to use CSS variables for the frontend
const CSS_VARS = {
  purple: 'var(--color-purple)',
  blue: 'var(--color-blue)',
  green: 'var(--color-green)',
  gold: 'var(--color-gold)',
  orange: 'var(--color-orange)',
  red: 'var(--color-red)',
};

// Export typed accessors with CSS variables overrides
export const COLOR_RAMP = CSS_VARS;
export const AXIS_COLORS = {
  civilRights: CSS_VARS.purple,
  openness: CSS_VARS.blue,
  redistribution: CSS_VARS.green,
  ethics: CSS_VARS.gold,
};
export const TYPE_NAMES = CONFIG.typeNames;
export const TYPE_SINGULAR_NAMES = CONFIG.typeSingularNames;
export const FAMILY_NAMES = CONFIG.familyNames;
export const SUB_TYPES = CONFIG.subTypes as Record<TypeId, SubTypeVariation[]>;
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
 * Get the singular display name for a type
 */
export function getTypeSingularName(typeId: TypeId): string {
  return TYPE_SINGULAR_NAMES[typeId] ?? TYPE_NAMES[typeId] ?? typeId.toUpperCase();
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
 * Scores are 0-5 where 0 = low pole (L/G/M/P), 5 = high pole (A/N/S/T)
 */
export function generateCallSign(
  civilRightsScore: number,
  opennessScore: number,
  redistributionScore: number,
  ethicsScore: number
): CallSign {
  const c: CivilRightsLetter = civilRightsScore < 2.5 ? 'L' : 'A';
  const o: OpennessLetter = opennessScore < 2.5 ? 'G' : 'N';
  const r: RedistributionLetter = redistributionScore < 2.5 ? 'M' : 'S';
  const e: EthicsLetter = ethicsScore < 2.5 ? 'P' : 'T';
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

/**
 * Get all sub-type variations for a type
 * Returns an array of SubTypeVariation objects with scores
 */
export function getSubTypes(typeId: TypeId): SubTypeVariation[] {
  return SUB_TYPES[typeId] ?? [];
}

export interface SubTypeWithMeta extends SubTypeVariation {
  typeId: TypeId;
  callSign: CallSign;
  parentName: string;
}

/**
 * Get all subtypes across all types with metadata
 */
export function getAllSubTypesWithMeta(): SubTypeWithMeta[] {
  const allTypes = getAllTypes();
  let allSubTypes: SubTypeWithMeta[] = [];
  
  for (const typeId of allTypes) {
    const subTypes = getSubTypes(typeId);
    const position = getTypePosition(typeId);
    if (!position) continue;
    
    const subtypesWithMeta = subTypes.map(st => ({
      ...st,
      typeId,
      callSign: position.callSign,
      parentName: getTypeName(typeId),
    }));
    
    allSubTypes = [...allSubTypes, ...subtypesWithMeta];
  }
  
  return allSubTypes;
}

/**
 * Get a specific sub-type variation by intensity level (1-3)
 * 1 = moderate intensity, 2 = medium intensity, 3 = extreme intensity
 */
export function getSubTypeByIntensity(typeId: TypeId, intensity: number): SubTypeVariation | undefined {
  const subTypes = getSubTypes(typeId);
  return subTypes.find(st => st.intensity === intensity);
}

/**
 * Get a specific sub-type name by intensity level (1-3)
 */
export function getSubTypeName(typeId: TypeId, intensity: number): string {
  const subType = getSubTypeByIntensity(typeId, intensity);
  return subType?.name ?? '';
}

/**
 * Get all sub-type names for a type (for backward compatibility)
 */
export function getSubTypeNames(typeId: TypeId): string[] {
  return getSubTypes(typeId).map(st => st.name);
}

/**
 * Find the best matching sub-type for given scores
 * Returns the subtype with the smallest distance from the input scores
 */
export function matchSubType(
  typeId: TypeId,
  civilRightsScore: number,
  opennessScore: number,
  redistributionScore: number,
  ethicsScore: number
): SubTypeVariation | undefined {
  const subTypes = getSubTypes(typeId);
  if (subTypes.length === 0) return undefined;
  
  let bestMatch = subTypes[0];
  let minDistance = Number.MAX_VALUE;
  
  for (const subType of subTypes) {
    const distance = Math.sqrt(
      Math.pow(subType.civil_rights_score - civilRightsScore, 2) +
      Math.pow(subType.openness_score - opennessScore, 2) +
      Math.pow(subType.redistribution_score - redistributionScore, 2) +
      Math.pow(subType.ethics_score - ethicsScore, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = subType;
    }
  }
  
  return bestMatch;
}

/**
 * Get the value descriptor for a given score (0-5) on an axis
 */
export function getAxisValueDescriptor(axisId: AxisId, score: number): string {
  const axis = AXES[axisId];
  const clampedScore = Math.max(0, Math.min(5, Math.round(score)));
  return axis.values[clampedScore] ?? '';
}

/**
 * Get all value descriptors for an axis
 */
export function getAxisValues(axisId: AxisId): string[] {
  return AXES[axisId].values;
}
