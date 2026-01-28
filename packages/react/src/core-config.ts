/**
 * CORE Configuration for FeedSlant
 *
 * This file contains the bundled configuration for the CORE political spectrum system:
 * - C: Civil Rights (Liberty vs Authority)
 * - O: Openness (Global vs National)
 * - R: Redistribution (Market vs Social)
 * - E: Ethics (Progressive vs Traditional)
 *
 * Each dimension uses a 0-5 scale with associated colors, labels, and emoji representations.
 */

// ============================================================================
// TypeScript Types
// ============================================================================

/**
 * The four dimensions of the CORE political spectrum system
 */
export type CoreDimensionKey = 'civilRights' | 'openness' | 'redistribution' | 'ethics';

/**
 * A complete CORE spectrum position with values for all four dimensions
 * Each dimension is scored from 0 (low/left) to 5 (high/right)
 */
export interface CoreSpectrum {
  civilRights: number;      // 0-5: Liberty (0) to Authority (5)
  openness: number;         // 0-5: Global (0) to National (5)
  redistribution: number;   // 0-5: Market (0) to Social (5)
  ethics: number;           // 0-5: Progressive (0) to Traditional (5)
}

// ============================================================================
// CORE Dimensions Definition
// ============================================================================

/**
 * Configuration for each of the four CORE dimensions
 *
 * Each dimension has:
 * - key: The dimension identifier (used in CoreSpectrum)
 * - label: Full display name
 * - shortName: Single-letter abbreviation (C, O, R, E)
 * - pair: Two-letter codes for low/high positions
 * - lowLabel: Label for values 0-2
 * - highLabel: Label for values 3-5
 */
export const CORE_DIMENSIONS = [
  {
    key: 'civilRights',
    label: 'Civil Rights',
    shortName: 'C',
    pair: ['L', 'A'],
    lowLabel: 'Liberty',
    highLabel: 'Authority'
  },
  {
    key: 'openness',
    label: 'Openness',
    shortName: 'O',
    pair: ['G', 'N'],
    lowLabel: 'Global',
    highLabel: 'National'
  },
  {
    key: 'redistribution',
    label: 'Redistribution',
    shortName: 'R',
    pair: ['M', 'S'],
    lowLabel: 'Market',
    highLabel: 'Social'
  },
  {
    key: 'ethics',
    label: 'Ethics',
    shortName: 'E',
    pair: ['P', 'T'],
    lowLabel: 'Progressive',
    highLabel: 'Traditional'
  },
] as const;

// ============================================================================
// Color Configuration
// ============================================================================

/**
 * 6-color ramp for the 0-5 scale used across all CORE dimensions
 *
 * Colors progress from purple (0) through blue, green, yellow, orange to red (5)
 * These colors are derived from bloc_config.json and provide visual differentiation
 * across the political spectrum.
 */
export const COLOR_RAMP = [
  "#7e568e", // Purple (0) - Most liberal/left position
  "#1f6adb", // Blue (1)
  "#398a34", // Green (2)
  "#eab308", // Yellow/Gold (3) - Center positions
  "#e67e22", // Orange (4)
  "#c0392b", // Red (5) - Most conservative/right position
] as const;

// ============================================================================
// Position Labels
// ============================================================================

/**
 * Detailed position labels for each value (0-5) on each CORE dimension
 *
 * These labels provide human-readable descriptions of what each numeric value
 * represents on each dimension. Sourced from bloc_config.json axes.*.values.
 */
export const POSITION_LABELS: Record<CoreDimensionKey, string[]> = {
  // Civil Rights: Liberty (0) to Authority (5)
  civilRights: [
    'abolish enforcement',      // 0 - Maximum liberty
    'civil libertarian',         // 1
    'privacy protections',       // 2
    'public safety measures',    // 3
    'surveillance state',        // 4
    'police state',              // 5 - Maximum authority
  ],

  // Openness: Global (0) to National (5)
  openness: [
    'open borders',              // 0 - Maximum global openness
    'free movement',             // 1
    'trade agreements',          // 2
    'controlled immigration',    // 3
    'strict border security',    // 4
    'closed borders',            // 5 - Maximum national closure
  ],

  // Redistribution: Market (0) to Social (5)
  redistribution: [
    'pure capitalism',           // 0 - Pure market economy
    'free markets',              // 1
    'mixed economy',             // 2
    'social programs',           // 3
    'wealth redistribution',     // 4
    'planned economy',           // 5 - Maximum redistribution
  ],

  // Ethics: Progressive (0) to Traditional (5)
  ethics: [
    'radical social change',     // 0 - Maximum progressive
    'progressive reform',        // 1
    'incremental progress',      // 2
    'preserve traditions',       // 3
    'traditional values',        // 4
    'enforce conformity',        // 5 - Maximum traditional
  ],
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the emoji square representation for a CORE dimension value
 *
 * @param value - A value from 0-5 representing a position on a CORE dimension
 * @returns An emoji square (🟪🟦🟩🟨🟧🟥) corresponding to the value
 *
 * The emojis match the COLOR_RAMP colors:
 * - 0: 🟪 Purple
 * - 1: 🟦 Blue
 * - 2: 🟩 Green
 * - 3: 🟨 Yellow
 * - 4: 🟧 Orange
 * - 5: 🟥 Red
 *
 * If the value is out of range, defaults to 🟨 (yellow/center)
 */
export function getEmojiSquare(value: number): string {
  // Map each value (0-5) to its corresponding emoji
  const emojis = ['🟪', '🟦', '🟩', '🟨', '🟧', '🟥'];

  // Return the emoji for this value, or default to yellow if out of range
  return emojis[value] ?? '🟨';
}

/**
 * Generate a 4-letter CORE code from a complete spectrum
 *
 * @param spectrum - A CoreSpectrum object with values for all four dimensions
 * @returns A 4-letter code representing the political position
 *
 * Each dimension contributes one letter based on whether the value is low (0-2) or high (3-5):
 * - Civil Rights: L (Liberty, 0-2) or A (Authority, 3-5)
 * - Openness: G (Global, 0-2) or N (National, 3-5)
 * - Redistribution: M (Market, 0-2) or S (Social, 3-5)
 * - Ethics: P (Progressive, 0-2) or T (Traditional, 3-5)
 *
 * Examples:
 * - LGMP: Liberty, Global, Market, Progressive (libertarian left)
 * - ANST: Authority, National, Social, Traditional (authoritarian right)
 * - LGST: Liberty, Global, Social, Traditional (unusual combination)
 */
export function getCoreCode(spectrum: CoreSpectrum): string {
  // For each dimension, determine which letter to use based on the value
  const letters = CORE_DIMENSIONS.map((dim) => {
    // Get the value for this dimension from the spectrum
    const value = spectrum[dim.key];

    // Get the low and high letter codes for this dimension
    const [low, high] = dim.pair;

    // Use the low letter (0-2) or high letter (3-5)
    // This creates a binary division at the midpoint of the 0-5 scale
    return value <= 2 ? low : high;
  });

  // Join all four letters into a single code string
  return letters.join('');
}
