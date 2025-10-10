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
 * Official React component for embedding Squares.vote widget
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
  primaryColor = '#4285f4',
  borderRadius = '12px',
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
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 600,
              borderRadius,
              cursor: 'pointer',
              boxShadow: shadow ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s ease',
              width: '100%',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.opacity = '0.9';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
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
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius,
            padding: '24px',
            boxShadow: shadow ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 600, color: '#111827' }}>
              Map Your Political Positions
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
              Use the TAME-R framework to visualize where you stand on 5 key policy dimensions
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                Example:
              </span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                Martin Luther King Jr.
              </span>
            </div>
            <div style={{ fontSize: '32px', marginBottom: '12px', letterSpacing: '4px', textAlign: 'center' }}>
              🟩🟦🟩🟧🟪
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280' }}>
              <span>Trade</span>
              <span>Abortion</span>
              <span>Migration</span>
              <span>Economics</span>
              <span>Rights</span>
            </div>
          </div>

          <button
            onClick={handleClick}
            style={{
              backgroundColor: primaryColor,
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 600,
              borderRadius: '8px',
              cursor: 'pointer',
              width: '100%',
              marginBottom: '12px',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.opacity = '0.9';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {buttonText}
          </button>

          <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
            Takes less than 2 minutes · Free & open source
          </p>
        </div>
      </div>
      {showWidget && <SquaresWidget onClose={() => setShowWidget(false)} primaryColor={primaryColor} />}
    </>
  );
}
