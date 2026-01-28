import React from 'react';

interface SquaresEmbedProps {
    variant?: 'card' | 'button';
    buttonText?: string;
    align?: 'left' | 'center' | 'right';
    maxWidth?: string;
    primaryColor?: string;
    borderRadius?: string;
    shadow?: boolean;
}
/**
 * Official React component for embedding squares.vote widget
 *
 * Completely self-contained with full interactive modal.
 * No external dependencies or iframes needed.
 *
 * @example
 * ```tsx
 * import { SquaresEmbedReact } from '@squares-app/react';
 *
 * function MyComponent() {
 *   return (
 *     <SquaresEmbedReact
 *       variant="card"
 *       maxWidth="600px"
 *       align="center"
 *     />
 *   );
 * }
 * ```
 */
declare function SquaresEmbedReact({ variant, buttonText, align, maxWidth, primaryColor, borderRadius, shadow, }: SquaresEmbedProps): React.JSX.Element;

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
/**
 * The four dimensions of the CORE political spectrum system
 */
type CoreDimensionKey = 'civilRights' | 'openness' | 'redistribution' | 'ethics';
/**
 * A complete CORE spectrum position with values for all four dimensions
 * Each dimension is scored from 0 (low/left) to 5 (high/right)
 */
interface CoreSpectrum {
    civilRights: number;
    openness: number;
    redistribution: number;
    ethics: number;
}
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
declare const CORE_DIMENSIONS: readonly [{
    readonly key: "civilRights";
    readonly label: "Civil Rights";
    readonly shortName: "C";
    readonly pair: readonly ["L", "A"];
    readonly lowLabel: "Liberty";
    readonly highLabel: "Authority";
}, {
    readonly key: "openness";
    readonly label: "Openness";
    readonly shortName: "O";
    readonly pair: readonly ["G", "N"];
    readonly lowLabel: "Global";
    readonly highLabel: "National";
}, {
    readonly key: "redistribution";
    readonly label: "Redistribution";
    readonly shortName: "R";
    readonly pair: readonly ["M", "S"];
    readonly lowLabel: "Market";
    readonly highLabel: "Social";
}, {
    readonly key: "ethics";
    readonly label: "Ethics";
    readonly shortName: "E";
    readonly pair: readonly ["P", "T"];
    readonly lowLabel: "Progressive";
    readonly highLabel: "Traditional";
}];
/**
 * 6-color ramp for the 0-5 scale used across all CORE dimensions
 *
 * Colors progress from purple (0) through blue, green, yellow, orange to red (5)
 * These colors are derived from bloc_config.json and provide visual differentiation
 * across the political spectrum.
 */
declare const COLOR_RAMP: readonly ["#7e568e", "#1f6adb", "#398a34", "#eab308", "#e67e22", "#c0392b"];
/**
 * Detailed position labels for each value (0-5) on each CORE dimension
 *
 * These labels provide human-readable descriptions of what each numeric value
 * represents on each dimension. Sourced from bloc_config.json axes.*.values.
 */
declare const POSITION_LABELS: Record<CoreDimensionKey, string[]>;
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
declare function getEmojiSquare(value: number): string;
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
declare function getCoreCode(spectrum: CoreSpectrum): string;

interface SquaresWidgetProps {
    onClose: (spectrum?: CoreSpectrum) => void;
    primaryColor?: string;
    initialSpectrum?: CoreSpectrum;
    initialStep?: number;
}
declare function SquaresWidget({ onClose, primaryColor, initialSpectrum, initialStep, }: SquaresWidgetProps): React.JSX.Element;

export { COLOR_RAMP, CORE_DIMENSIONS, type CoreDimensionKey, type CoreSpectrum, POSITION_LABELS, type SquaresEmbedProps, SquaresEmbedReact, SquaresWidget, type SquaresWidgetProps, getCoreCode, getEmojiSquare };
