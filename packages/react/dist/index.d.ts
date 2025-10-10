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
 * Official React component for embedding Squares.vote widget
 *
 * @example
 * ```tsx
 * import { SquaresEmbedReact } from '@squares/react';
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
declare global {
    interface Window {
        SquaresEmbed?: {
            init: (options: {
                elementId: string;
                variant?: 'card' | 'button';
                buttonText?: string;
                align?: 'left' | 'center' | 'right';
                maxWidth?: string | null;
                primaryColor?: string | null;
                borderRadius?: string | null;
                shadow?: boolean;
            }) => void;
            destroy: (elementId: string) => void;
        };
    }
}

export { type SquaresEmbedProps, SquaresEmbedReact };
