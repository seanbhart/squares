'use client';

import React, { useState } from 'react';
import { SquaresWidget } from './SquaresWidget';

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
export function SquaresEmbedReact({
  variant = 'card',
  buttonText = 'Map Your Squares',
  align = 'center',
  maxWidth,
  primaryColor = '#57534e',
  borderRadius = '16px',
  shadow = true,
}: SquaresEmbedProps) {
  const [showWidget, setShowWidget] = useState(false);

  const handleClick = () => {
    setShowWidget(true);
  };

  // Container styles
  const containerStyle: React.CSSProperties = {
    width: '100%',
    position: 'relative',
    ...(align === 'left' && { marginLeft: 0, marginRight: 'auto' }),
    ...(align === 'right' && { marginLeft: 'auto', marginRight: 0 }),
    ...(align === 'center' && { marginLeft: 'auto', marginRight: 'auto' }),
    ...(maxWidth && { maxWidth }),
  };

  if (variant === 'button') {
    return (
      <>
        <div style={containerStyle}>
          <button
            onClick={handleClick}
            style={{
              backgroundColor: primaryColor,
              color: 'white',
              border: 'none',
              padding: 'clamp(12px, 2.5vw, 16px) clamp(20px, 4vw, 32px)',
              fontSize: 'clamp(0.9375rem, 2vw, 1.0625rem)',
              fontWeight: 600,
              borderRadius,
              cursor: 'pointer',
              boxShadow: shadow ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
              transition: 'all 0.2s ease',
              width: '100%',
              fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = shadow ? '0 4px 12px rgba(0, 0, 0, 0.12)' : 'none';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = shadow ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none';
            }}
          >
            {buttonText}
          </button>
        </div>
        {showWidget && <SquaresWidget onClose={() => setShowWidget(false)} primaryColor={primaryColor} />}
      </>
    );
  }

  // Card variant
  return (
    <>
      <div style={containerStyle}>
        <div
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius,
            padding: 'clamp(20px, 4vw, 32px)',
            boxShadow: shadow ? '0 4px 12px rgba(0, 0, 0, 0.08)' : 'none',
            fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 'clamp(1.375rem, 3vw, 1.75rem)', fontWeight: 700, color: '#292524', lineHeight: 1.2 }}>
              Map Your Political Positions
            </h3>
            <p style={{ margin: 0, fontSize: 'clamp(0.9375rem, 2vw, 1rem)', color: '#78716c', lineHeight: '1.5' }}>
              Use the TAME-R framework to visualize where you stand on 5 key policy dimensions
            </p>
          </div>

          <div
            style={{
              background: 'rgba(249, 250, 251, 0.6)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              borderRadius: '12px',
              padding: 'clamp(16px, 3vw, 20px)',
              marginBottom: '24px',
            }}
          >
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                EXAMPLE:
              </span>
              <span style={{ fontSize: 'clamp(0.9375rem, 2vw, 1rem)', fontWeight: 600, color: '#292524' }}>
                Martin Luther King Jr.
              </span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(2rem, 6vw, 2.5rem)', marginBottom: '12px', display: 'flex', justifyContent: 'center', gap: 'clamp(4px, 1vw, 8px)' }}>
                <span>🟩</span>
                <span>🟦</span>
                <span>🟩</span>
                <span>🟧</span>
                <span>🟪</span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#78716c', display: 'flex', justifyContent: 'center', gap: 'clamp(8px, 2vw, 16px)', flexWrap: 'wrap', fontWeight: 500 }}>
                <span>Trade</span>
                <span>Abortion</span>
                <span>Migration</span>
                <span>Economics</span>
                <span>Rights</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleClick}
            style={{
              backgroundColor: primaryColor,
              color: 'white',
              border: 'none',
              padding: 'clamp(12px, 2.5vw, 16px) clamp(20px, 4vw, 32px)',
              fontSize: 'clamp(0.9375rem, 2vw, 1.0625rem)',
              fontWeight: 600,
              borderRadius: '12px',
              cursor: 'pointer',
              width: '100%',
              marginBottom: '16px',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.08)';
            }}
          >
            {buttonText}
          </button>

          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#a8a29e', textAlign: 'center', lineHeight: 1.5 }}>
            Takes less than 2 minutes · Free & open source
          </p>
        </div>
      </div>
      {showWidget && <SquaresWidget onClose={() => setShowWidget(false)} primaryColor={primaryColor} />}
    </>
  );
}
