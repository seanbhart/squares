'use client';

import React, { useState, useCallback } from 'react';

/**
 * @deprecated This widget uses the legacy TAMER framework (5 dimensions, 0-6 scale).
 * It needs to be migrated to the CORE framework (4 dimensions: Civil Rights, Openness,
 * Redistribution, Ethics with 0-5 scale).
 *
 * TODO: CORE Migration Required
 * - Change POLICIES from 5 TAMER dimensions to 4 CORE dimensions (C, O, R, E)
 * - Update COLOR_RAMP from 7 colors (0-6) to 6 colors (0-5)
 * - Update POSITION_LABELS to 6 values per dimension using bloc_config.json axes.*.values
 * - Update EXAMPLE_FIGURES to use 4-element spectrum arrays
 * - Update getEmojiSquare to use 6-emoji array
 * - Update getSignatureText to use 'C', 'O', 'R', 'E' letters
 * - Update all UI text references (e.g., "7-color spectrum" -> "6-color spectrum")
 *
 * Reference files:
 * - /lib/core-config.ts for CORE_DIMENSIONS definitions
 * - /analytics/bloc_config.json for dimension labels and values
 */
export interface SquaresWidgetProps {
  onClose: (spectrum?: Record<string, number>) => void;
  primaryColor?: string;
  initialSpectrum?: Record<string, number>;
  initialStep?: number;
}

// TODO: CORE Migration - Update theme colors if needed for new framework
// Theme colors matching app/globals.css
const COLORS = {
  bgPrimary: '#121113',
  bgSecondary: '#1A191B',
  surface: 'rgba(24, 23, 25, 0.85)',
  textPrimary: '#ffffff',
  textSecondary: '#B8B8B9',
  textMuted: '#7A797B',
  accent: '#e5e5e5',
  accentText: '#121113',
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.12)',
} as const;

// TODO: CORE Migration - Replace with 4 CORE dimensions:
// { key: 'civilRights', label: 'Civil Rights', shortName: 'C' },
// { key: 'openness', label: 'Openness', shortName: 'O' },
// { key: 'redistribution', label: 'Redistribution', shortName: 'R' },
// { key: 'ethics', label: 'Ethics', shortName: 'E' },
const POLICIES = [
  { key: 'trade', label: 'Trade', emoji: '🌐' },
  { key: 'abortion', label: 'Abortion', emoji: '🤰' },
  { key: 'migration', label: 'Migration', emoji: '🌍' },
  { key: 'economics', label: 'Economics', emoji: '💰' },
  { key: 'rights', label: 'Rights', emoji: '🏳️‍🌈' },
];

// TODO: CORE Migration - Change to 6 colors for 0-5 scale:
// ["#7e568e", "#1f6adb", "#398a34", "#eab308", "#e67e22", "#c0392b"]
// (Remove the 7th dark slate color)
const COLOR_RAMP = [
  "#7e568e", // Purple (Trade)
  "#1f6adb", // Blue (Abortion)
  "#398a34", // Green
  "#eab308", // Yellow/Orange (Economics)
  "#e67e22", // Orange
  "#c0392b", // Red (Migration)
  "#383b3d", // Dark slate
] as const;

// TODO: CORE Migration - Replace with 4 CORE dimensions, 6 values each (from bloc_config.json):
// civilRights: ['abolish enforcement', 'civil libertarian', 'privacy protections', 'public safety measures', 'surveillance state', 'police state']
// openness: ['open borders', 'free movement', 'trade agreements', 'controlled immigration', 'strict border security', 'closed borders']
// redistribution: ['pure capitalism', 'free markets', 'mixed economy', 'social programs', 'wealth redistribution', 'planned economy']
// ethics: ['radical social change', 'progressive reform', 'incremental progress', 'preserve traditions', 'traditional values', 'enforce conformity']
const POSITION_LABELS: Record<string, string[]> = {
  trade: [
    'free trade',
    'minimal tariffs',
    'selective trade agreements',
    'balanced tariffs',
    'strategic protections',
    'heavy tariffs',
    'closed economy'
  ],
  abortion: [
    'no gestational limit',
    'limit after second trimester',
    'limit after viability',
    'limit after 15 weeks',
    'limit after first trimester',
    'limit after heartbeat detection',
    'total ban'
  ],
  migration: [
    'open borders',
    'easy pathways to citizenship',
    'expanded quotas',
    'current restrictions',
    'reduced quotas',
    'strict limits only',
    'no immigration'
  ],
  economics: [
    'pure free market',
    'minimal regulation',
    'market-based with safety net',
    'balanced public-private',
    'strong social programs',
    'extensive public ownership',
    'full state control'
  ],
  rights: [
    'full legal equality',
    'protections with few limits',
    'protections with some limits',
    'tolerance without endorsement',
    'traditional definitions only',
    'no legal recognition',
    'criminalization'
  ]
};

// TODO: CORE Migration - Update to 4-element spectrum arrays [C, O, R, E]:
// Example: { name: 'Example', spectrum: [2, 1, 3, 2], ... }
// Scores should be 0-5 for each dimension
const EXAMPLE_FIGURES = [
  {
    name: 'Martin Luther King Jr.',
    spectrum: [2, 1, 2, 4, 0],
    period: '1963-1965',
    title: 'Civil Rights Movement Leadership',
    description: 'Led the March on Washington and Selma campaign, advocating for civil rights legislation and voting rights while maintaining nonviolent resistance.'
  },
  {
    name: 'Ronald Reagan',
    spectrum: [0, 5, 3, 1, 4],
    period: '1981-1989',
    title: 'Reagan Presidency',
    description: 'Presidency marked by supply-side economics, conservative social policies, and strong anti-communist foreign policy during the Cold War.'
  },
  {
    name: 'Franklin D. Roosevelt',
    spectrum: [3, 2, 2, 5, 2],
    period: '1933-1936',
    title: 'First New Deal',
    description: 'First term implementing the New Deal programs to combat the Great Depression through unprecedented government intervention in the economy.'
  },
];

function ColorSquare({ value, size = '48px', showBorder = true }: { value: number; size?: string; showBorder?: boolean }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: size === '48px' ? '10px' : (size === '32px' ? '8px' : '12px'),
      backgroundColor: COLOR_RAMP[value],
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      border: showBorder ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
      flexShrink: 0
    }} />
  );
}

export function SquaresWidget({ 
  onClose, 
  primaryColor = '#57534e',
  initialSpectrum,
  initialStep = 0,
}: SquaresWidgetProps) {
  const [step, setStep] = useState(initialStep);
  const [spectrum, setSpectrum] = useState<Record<string, number>>(initialSpectrum || {
    trade: 3,
    abortion: 3,
    migration: 3,
    economics: 3,
    rights: 3,
  });
  const [copied, setCopied] = useState(false);
  const [currentDimension, setCurrentDimension] = useState(0);
  const [selectedSpectrumDimension, setSelectedSpectrumDimension] = useState(0);

  // TODO: CORE Migration - Change to 6 emojis for 0-5 scale:
  // ['🟪', '🟦', '🟩', '🟨', '🟧', '🟥']
  const getEmojiSquare = (value: number): string => {
    const emojis = ['🟪', '🟦', '🟩', '🟨', '🟧', '🟥', '⬛️'];
    return emojis[value] || '🟨';
  };

  // TODO: CORE Migration - Change to ['C', 'O', 'R', 'E'] letters
  const getSignatureText = () => {
    const letters = ['T', 'A', 'M', 'E', 'R'];
    return POLICIES.map((p, i) => `${letters[i]}${spectrum[p.key]}`).join(' ');
  };

  const getEmojiText = () => {
    return POLICIES.map((p) => getEmojiSquare(spectrum[p.key])).join('');
  };

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getEmojiText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [spectrum]);

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ margin: '0 0 3rem 0', color: COLORS.textPrimary, fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, lineHeight: 1.2, textAlign: 'center' }}>
              You're not one word.<br />
              Your politics are unique.
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', margin: '2rem 0', flexWrap: 'wrap' }}>
              {POLICIES.map((policy, index) => {
                const letters = ['T', 'A', 'M', 'E', 'R'];
                const colors = [COLOR_RAMP[0], COLOR_RAMP[1], COLOR_RAMP[6], COLOR_RAMP[4], COLOR_RAMP[2]];
                return (
                  <div key={policy.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '12px', backgroundColor: colors[index], display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', border: `1px solid ${COLORS.border}` }}>
                      <span style={{ fontSize: '2.5rem', color: 'white', fontWeight: 900 }}>{letters[index]}</span>
                    </div>
                    <span style={{ color: COLORS.textPrimary, fontSize: '0.875rem', fontWeight: 600 }}>{policy.label.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: '1rem', color: COLORS.textSecondary, textAlign: 'center', marginTop: '2rem', lineHeight: 1.6 }}>
              Square your<br />political personality.
            </p>
          </div>
        );

      case 1: {
        const selectedPolicy = POLICIES[selectedSpectrumDimension];
        const letters = ['T', 'A', 'M', 'E', 'R'];
        const colors = [COLOR_RAMP[0], COLOR_RAMP[1], COLOR_RAMP[6], COLOR_RAMP[4], COLOR_RAMP[2]];
        
        return (
          <div style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ margin: '0 0 2rem 0', color: COLORS.textPrimary, fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, textAlign: 'center' }}>
              Each Square uses a<br />7-color spectrum
            </h2>
            
            <div style={{ margin: '1.5rem 0' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', justifyContent: 'center' }}>
                {COLOR_RAMP.map((color, i) => (
                  <ColorSquare key={i} value={i} size="48px" />
                ))}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.25rem', marginBottom: '1.5rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: COLORS.textSecondary, fontWeight: 600 }}>Minimal intervention</span>
                <span style={{ fontSize: '1rem', color: COLORS.textMuted }}>→</span>
                <span style={{ fontSize: '0.75rem', color: COLORS.textSecondary, fontWeight: 600 }}>Total control</span>
              </div>
            </div>

            <p style={{ fontSize: '0.9375rem', color: COLORS.textSecondary, textAlign: 'center', marginBottom: '1rem' }}>
              See what the scale means for each Square:
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {POLICIES.map((policy, index) => (
                <button
                  key={policy.key}
                  onClick={() => setSelectedSpectrumDimension(index)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.75rem 1rem',
                    background: selectedSpectrumDimension === index ? 'rgba(255, 255, 255, 0.08)' : COLORS.surface,
                    border: selectedSpectrumDimension === index ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minWidth: '80px',
                    boxShadow: selectedSpectrumDimension === index ? '0 4px 16px rgba(255, 255, 255, 0.15)' : 'none',
                    color: COLORS.textPrimary,
                    WebkitTapHighlightColor: 'transparent',
                    fontFamily: 'inherit'
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: COLORS.bgSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)', border: `1px solid ${COLORS.borderStrong}` }}>
                    <span style={{ fontSize: '1.25rem', color: COLORS.accent, fontWeight: 900 }}>{letters[index]}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: COLORS.textPrimary, fontWeight: 600 }}>{policy.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            <div style={{ background: COLORS.surface, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${COLORS.border}` }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', color: COLORS.textPrimary, fontWeight: 600, textAlign: 'center' }}>
                {selectedPolicy.label}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {POSITION_LABELS[selectedPolicy.key].map((label, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <ColorSquare value={index} size="32px" />
                    <span style={{ fontSize: '0.875rem', color: COLORS.textPrimary, flex: 1 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 2: {
        const policy = POLICIES[currentDimension];
        const letters = ['T', 'A', 'M', 'E', 'R'];
        const colors = [COLOR_RAMP[0], COLOR_RAMP[1], COLOR_RAMP[6], COLOR_RAMP[4], COLOR_RAMP[2]];
        const isLastDimension = currentDimension === POLICIES.length - 1;
        
        return (
          <div style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.875rem', color: COLORS.textSecondary, fontWeight: 600, marginBottom: '0.75rem', letterSpacing: '0.1em' }}>
                {currentDimension + 1} OF {POLICIES.length}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                {POLICIES.map((p, i) => {
                  const hasAnswer = spectrum[p.key] !== undefined && spectrum[p.key] !== null;
                  const dotColor = hasAnswer ? COLOR_RAMP[spectrum[p.key]] : (i === currentDimension ? COLORS.textMuted : COLORS.surface);
                  return (
                    <div 
                      key={i}
                      style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        backgroundColor: dotColor,
                        transition: 'background-color 0.2s'
                      }} 
                    />
                  );
                })}
              </div>
              <div style={{ display: 'inline-block', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '16px', 
                  backgroundColor: spectrum[policy.key] !== undefined && spectrum[policy.key] !== null ? COLOR_RAMP[spectrum[policy.key]] : COLORS.bgSecondary, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)', 
                  border: `1px solid ${COLORS.borderStrong}`,
                  transition: 'background-color 0.3s ease'
                }}>
                  <span style={{ fontSize: '3rem', color: 'white', fontWeight: 900 }}>{letters[currentDimension]}</span>
                </div>
              </div>
              <h2 style={{ margin: '0 0 1rem 0', color: COLORS.textPrimary, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800 }}>
                {policy.label}
              </h2>
              <p style={{ fontSize: '1rem', color: COLORS.textSecondary, marginBottom: '2rem' }}>
                Where do you stand on government intervention?
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
              {POSITION_LABELS[policy.key].map((label, valueIndex) => {
                const isSelected = spectrum[policy.key] === valueIndex;
                const isCenter = valueIndex === 3;
                return (
                  <button
                    key={valueIndex}
                    onClick={() => setSpectrum(prev => ({ ...prev, [policy.key]: valueIndex }))}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.625rem',
                      padding: '0.875rem 0.5rem',
                      background: isSelected ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                      border: isSelected 
                        ? '2px solid rgba(255, 255, 255, 0.4)' 
                        : isCenter 
                          ? '1px dashed rgba(255, 255, 255, 0.2)'
                          : '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: 'none'
                    }}
                  >
                    <ColorSquare value={valueIndex} size="60px" />
                    <span style={{ fontSize: '0.75rem', color: COLORS.textPrimary, textAlign: 'center', lineHeight: 1.3, fontWeight: 400 }}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: COLORS.textSecondary, fontWeight: 500 }}>
              <span>Minimal intervention</span>
              <span style={{ margin: '0 0.75rem' }}>→</span>
              <span>Total control</span>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              {!isLastDimension ? (
                <button
                  onClick={() => setCurrentDimension(currentDimension + 1)}
                  style={{
                    padding: '1rem 2rem',
                    background: '#e5e5e5',
                    color: COLORS.accentText,
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#e5e5e5';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.2)';
                  }}
                >
                  Next Square →
                </button>
              ) : (
                <button
                  onClick={() => setStep(3)}
                  style={{
                    padding: '1rem 2rem',
                    background: '#e5e5e5',
                    color: COLORS.accentText,
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#e5e5e5';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.2)';
                  }}
                >
                  See Your Squares →
                </button>
              )}
            </div>
          </div>
        );
      }

      case 3:
        return (
          <div style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ margin: '0 0 3rem 0', color: COLORS.textPrimary, fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, lineHeight: 1.2, textAlign: 'center' }}>
              Your Political Spectrum
            </h2>
            
            <div style={{ textAlign: 'center', margin: '2rem 0', padding: '2.5rem 2rem', background: COLORS.surface, borderRadius: '16px', border: `1px solid ${COLORS.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(0.5rem, 1.5vw, 1rem)', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {POLICIES.map((policy, i) => (
                  <div key={policy.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <ColorSquare value={spectrum[policy.key]} size="64px" />
                    <span style={{ fontSize: '0.75rem', color: COLORS.textSecondary, fontWeight: 600, letterSpacing: '0.02em' }}>
                      {['T', 'A', 'M', 'E', 'R'][i]}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(0.5rem, 1.5vw, 1rem)', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                {POLICIES.map((policy) => (
                  <span key={policy.key} style={{ fontSize: '0.6875rem', color: COLORS.textMuted, fontWeight: 500, textTransform: 'lowercase' }}>
                    {policy.label}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: '2rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'center', gap: '0.125rem' }}>
                {POLICIES.map((policy) => (
                  <span key={policy.key}>{getEmojiSquare(spectrum[policy.key])}</span>
                ))}
              </div>
            </div>

            <button 
              onClick={handleCopy}
              style={{
                padding: '1.125rem 2rem',
                background: '#e5e5e5',
                color: COLORS.accentText,
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.0625rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%',
                marginBottom: '1rem',
                boxShadow: '0 4px 12px rgba(255, 255, 255, 0.2)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 255, 255, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#e5e5e5';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.2)';
              }}
            >
              {copied ? '✓ Copied!' : 'Copy Spectrum as Emojis'}
            </button>
            
            <button 
              onClick={() => window.open('https://squares.vote', '_blank', 'noopener,noreferrer')}
              style={{
                padding: '1.125rem 2rem',
                background: 'transparent',
                color: COLORS.accent,
                border: '2px solid #525252',
                borderRadius: '12px',
                fontSize: '1.0625rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%',
                marginBottom: '1rem'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = '#737373';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = '#525252';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Take the Full Assessment →
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => {
                  setStep(0);
                  setCurrentDimension(0);
                  setSpectrum({
                    trade: 3,
                    abortion: 3,
                    migration: 3,
                    economics: 3,
                    rights: 3,
                  });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: COLORS.textSecondary,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  transition: 'all 0.2s',
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = '#a3a3a3';
                }}
              >
                Start Over
              </button>
              
              <span style={{ color: '#525252' }}>•</span>
              
              <button
                onClick={() => onClose(spectrum)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: COLORS.textSecondary,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  transition: 'all 0.2s',
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = '#a3a3a3';
                }}
              >
                Close
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={() => onClose()}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        button {
          -webkit-tap-highlight-color: transparent;
          -webkit-appearance: none;
          appearance: none;
          font-family: inherit;
        }
        button, button * {
          color: inherit;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 3px solid ${primaryColor};
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 3px solid ${primaryColor};
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
      `}</style>
      <div 
        style={{
          background: COLORS.bgPrimary,
          borderRadius: '20px',
          maxWidth: '640px',
          width: '92%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          animation: 'slideUp 0.3s ease-out',
          fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          border: `1px solid ${COLORS.border}`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={() => onClose()}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: COLORS.textMuted,
            lineHeight: '1',
            padding: 0,
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 300
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = '#e5e5e5';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = COLORS.textMuted;
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          }}
        >
          ×
        </button>
        
        {step !== 2 && (
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center' }}>
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  style={{
                    width: i === step ? '32px' : '10px',
                    height: '10px',
                    borderRadius: '6px',
                    background: i === step ? COLORS.accent : (i < step ? 'rgba(229, 229, 229, 0.3)' : 'rgba(115, 115, 115, 0.3)'),
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: i === step ? 'scale(1)' : 'scale(0.9)'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {renderStep()}

        {step !== 2 && step !== 3 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            {step > 0 && (
              <button 
                onClick={() => setStep(step - 1)}
                style={{
                  padding: '0.875rem 1.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: 'transparent',
                  color: COLORS.accent
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                ← Back
              </button>
            )}
            <button 
              onClick={() => setStep(step + 1)}
              style={{
                padding: '0.875rem 1.75rem',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: '#e5e5e5',
                color: COLORS.accentText,
                marginLeft: 'auto',
                boxShadow: '0 4px 12px rgba(255, 255, 255, 0.2)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 255, 255, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#e5e5e5';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.2)';
              }}
            >
              Continue →
            </button>
          </div>
        )}
        
        {step === 2 && currentDimension > 0 && (
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
            <button 
              onClick={() => setCurrentDimension(currentDimension - 1)}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: 'transparent',
                color: COLORS.textSecondary
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.color = '#a3a3a3';
              }}
            >
              ← Previous Square
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
