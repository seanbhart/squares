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

interface SquaresWidgetProps {
    onClose: (spectrum?: Record<string, number>) => void;
    primaryColor?: string;
    initialSpectrum?: Record<string, number>;
    initialStep?: number;
}
declare function SquaresWidget({ onClose, primaryColor, initialSpectrum, initialStep, }: SquaresWidgetProps): React.JSX.Element;

export { type SquaresEmbedProps, SquaresEmbedReact, SquaresWidget, type SquaresWidgetProps };
