'use client';

import React, { useEffect, useRef } from 'react';

export interface SquaresEmbedProps {
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
export function SquaresEmbedReact({
  variant = 'card',
  buttonText = 'Map Your Squares',
  align = 'center',
  maxWidth,
  primaryColor,
  borderRadius,
  shadow = true,
}: SquaresEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementIdRef = useRef(`squares-widget-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // Dynamically load the embed script if not already loaded
    if (!window.SquaresEmbed) {
      const script = document.createElement('script');
      script.src = 'https://squares.vote/embed.js';
      script.async = true;
      
      script.onload = () => {
        initializeWidget();
      };
      
      document.body.appendChild(script);
      
      return () => {
        // Cleanup: remove script on unmount
        document.body.removeChild(script);
      };
    } else {
      // Script already loaded, initialize immediately
      initializeWidget();
    }

    function initializeWidget() {
      if (window.SquaresEmbed && containerRef.current) {
        window.SquaresEmbed.init({
          elementId: elementIdRef.current,
          variant,
          buttonText,
          align,
          maxWidth,
          primaryColor,
          borderRadius,
          shadow,
        });
      }
    }

    // Cleanup function
    return () => {
      if (window.SquaresEmbed) {
        window.SquaresEmbed.destroy(elementIdRef.current);
      }
    };
  }, [variant, buttonText, align, maxWidth, primaryColor, borderRadius, shadow]);

  return <div ref={containerRef} id={elementIdRef.current} />;
}

// Type declaration for window.SquaresEmbed
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
