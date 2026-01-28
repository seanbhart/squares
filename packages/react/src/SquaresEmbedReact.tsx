'use client';

import React, { useState } from 'react';
import { SquaresWidget } from './SquaresWidget';
import { COLOR_RAMP } from './core-config';

// Theme colors matching app/globals.css
const COLORS = {
  bgPrimary: '#121113',
  bgSecondary: '#1A191B',
  textPrimary: '#ffffff',
  textSecondary: '#B8B8B9',
  textMuted: '#7A797B',
  accent: '#e5e5e5',
  accentText: '#121113',
  border: 'rgba(255, 255, 255, 0.08)',
} as const;

function ColorSquare({ value, size = 48 }: { value: number; size?: number }) {
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '8px',
      backgroundColor: COLOR_RAMP[value],
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      flexShrink: 0
    }} />
  );
}

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
  buttonText = 'Square Your Political Personality',
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
            background: COLORS.bgPrimary,
            border: `1px solid ${COLORS.border}`,
            borderRadius,
            padding: 'clamp(20px, 4vw, 32px)',
            boxShadow: shadow ? '0 4px 12px rgba(0, 0, 0, 0.4)' : 'none',
            fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 'clamp(1.375rem, 3vw, 1.75rem)', fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1.2 }}>
              Square Your Political Personality
            </h3>
            <p style={{ margin: 0, fontSize: 'clamp(0.9375rem, 2vw, 1rem)', color: COLORS.textSecondary, lineHeight: '1.5' }}>
              Square yourself across four political dimensions
            </p>
          </div>

          <div
            style={{
              background: COLORS.bgSecondary,
              border: `1px solid ${COLORS.border}`,
              borderRadius: '12px',
              padding: 'clamp(16px, 3vw, 20px)',
              marginBottom: '24px',
            }}
          >
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                EXAMPLE:
              </span>
              <span style={{ fontSize: 'clamp(0.9375rem, 2vw, 1rem)', fontWeight: 600, color: COLORS.textPrimary }}>
                Martin Luther King Jr.
              </span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center', gap: 'clamp(6px, 1.5vw, 12px)' }}>
                <ColorSquare value={1} size={48} />
                <ColorSquare value={1} size={48} />
                <ColorSquare value={4} size={48} />
                <ColorSquare value={1} size={48} />
              </div>
              <div style={{ fontSize: '0.6875rem', color: COLORS.textSecondary, display: 'flex', justifyContent: 'center', gap: 'clamp(8px, 2vw, 16px)', flexWrap: 'wrap', fontWeight: 500 }}>
                <span>Civil Rights</span>
                <span>Openness</span>
                <span>Redistribution</span>
                <span>Ethics</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleClick}
            style={{
              backgroundColor: COLORS.accent,
              color: COLORS.accentText,
              border: 'none',
              padding: 'clamp(12px, 2.5vw, 16px) clamp(20px, 4vw, 32px)',
              fontSize: 'clamp(0.9375rem, 2vw, 1.0625rem)',
              fontWeight: 600,
              borderRadius: '12px',
              cursor: 'pointer',
              width: '100%',
              marginBottom: '16px',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(255, 255, 255, 0.2)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 255, 255, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.accent;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.2)';
            }}
          >
            {buttonText}
          </button>

          <p style={{ margin: 0, fontSize: '0.8125rem', color: COLORS.textMuted, textAlign: 'center', lineHeight: 1.5 }}>
            Takes less than 2 minutes · Free & open source
          </p>
        </div>
      </div>
      {showWidget && <SquaresWidget onClose={() => setShowWidget(false)} primaryColor={primaryColor} />}
    </>
  );
}
