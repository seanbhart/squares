'use client';

import React, { useState, useCallback } from 'react';

export interface SquaresWidgetProps {
  onClose: (spectrum?: Record<string, number>) => void;
  primaryColor?: string;
  initialSpectrum?: Record<string, number>;
  initialStep?: number;
}

const POLICIES = [
  { key: 'trade', label: 'Trade', emoji: '🌐' },
  { key: 'abortion', label: 'Abortion', emoji: '🤰' },
  { key: 'migration', label: 'Migration', emoji: '🌍' },
  { key: 'economics', label: 'Economics', emoji: '💰' },
  { key: 'rights', label: 'Rights', emoji: '🏳️‍🌈' },
];

const COLOR_RAMP = [
  "#7e568e", // Purple (Trade)
  "#1f6adb", // Blue (Abortion)
  "#398a34", // Green
  "#eab308", // Yellow/Orange (Economics)
  "#e67e22", // Orange
  "#c0392b", // Red (Migration)
  "#383b3d", // Dark slate
] as const;

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
    'partial birth abortion',
    'limit after viability',
    'limit after third trimester',
    'limit after second trimester',
    'limit after first trimester',
    'limit after heartbeat detection',
    'no exceptions allowed'
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

  const getSignatureText = () => {
    const letters = ['T', 'A', 'M', 'E', 'R'];
    return POLICIES.map((p, i) => `${letters[i]}${spectrum[p.key]}`).join(' ');
  };

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getSignatureText());
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
            <h2 style={{ margin: '0 0 3rem 0', color: '#ffffff', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, lineHeight: 1.2, textAlign: 'center' }}>
              You're not one word.<br />
              You're many dimensions.
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', margin: '2rem 0', flexWrap: 'wrap' }}>
              {POLICIES.map((policy, index) => {
                const letters = ['T', 'A', 'M', 'E', 'R'];
                const colors = [COLOR_RAMP[0], COLOR_RAMP[1], COLOR_RAMP[6], COLOR_RAMP[4], COLOR_RAMP[2]];
                return (
                  <div key={policy.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '12px', backgroundColor: colors[index], display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <span style={{ fontSize: '2.5rem', color: 'white', fontWeight: 900 }}>{letters[index]}</span>
                    </div>
                    <span style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: 600 }}>{policy.label.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: '1rem', color: '#a3a3a3', textAlign: 'center', marginTop: '2rem', lineHeight: 1.6 }}>
              TAME-R measures where you stand on five<br />independent policy dimensions.
            </p>
          </div>
        );

      case 1: {
        const selectedPolicy = POLICIES[selectedSpectrumDimension];
        const letters = ['T', 'A', 'M', 'E', 'R'];
        const colors = [COLOR_RAMP[0], COLOR_RAMP[1], COLOR_RAMP[6], COLOR_RAMP[4], COLOR_RAMP[2]];
        
        return (
          <div style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ margin: '0 0 2rem 0', color: '#ffffff', fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, textAlign: 'center' }}>
              Each dimension uses a<br />7-color spectrum
            </h2>
            
            <div style={{ margin: '1.5rem 0' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', justifyContent: 'center' }}>
                {COLOR_RAMP.map((color, i) => (
                  <ColorSquare key={i} value={i} size="48px" />
                ))}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.25rem', marginBottom: '1.5rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#a3a3a3', fontWeight: 600 }}>Minimal intervention</span>
                <span style={{ fontSize: '1rem', color: '#737373' }}>→</span>
                <span style={{ fontSize: '0.75rem', color: '#a3a3a3', fontWeight: 600 }}>Total control</span>
              </div>
            </div>

            <p style={{ fontSize: '0.9375rem', color: '#a3a3a3', textAlign: 'center', marginBottom: '1rem' }}>
              See what the scale means for each dimension:
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
                    background: selectedSpectrumDimension === index ? 'rgba(255, 255, 255, 0.08)' : 'rgba(30, 30, 30, 0.8)',
                    border: selectedSpectrumDimension === index ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minWidth: '80px',
                    boxShadow: selectedSpectrumDimension === index ? '0 4px 16px rgba(255, 255, 255, 0.15)' : 'none'
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#333333', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                    <span style={{ fontSize: '1.25rem', color: '#e5e5e5', fontWeight: 900 }}>{letters[index]}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 600 }}>{policy.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            <div style={{ background: 'rgba(30, 30, 30, 0.8)', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', color: '#ffffff', fontWeight: 600, textAlign: 'center' }}>
                {selectedPolicy.label}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {POSITION_LABELS[selectedPolicy.key].map((label, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <ColorSquare value={index} size="32px" />
                    <span style={{ fontSize: '0.875rem', color: '#ffffff', flex: 1 }}>{label}</span>
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
              <div style={{ display: 'inline-block', marginBottom: '1rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '16px', backgroundColor: '#333333', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                  <span style={{ fontSize: '3rem', color: '#e5e5e5', fontWeight: 900 }}>{letters[currentDimension]}</span>
                </div>
              </div>
              <h2 style={{ margin: '0 0 1rem 0', color: '#ffffff', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800 }}>
                {policy.label}
              </h2>
              <p style={{ fontSize: '1rem', color: '#a3a3a3', marginBottom: '2rem' }}>
                Where do you stand on government intervention?
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
              {POSITION_LABELS[policy.key].map((label, valueIndex) => {
                const isSelected = spectrum[policy.key] === valueIndex;
                return (
                  <button
                    key={valueIndex}
                    onClick={() => setSpectrum(prev => ({ ...prev, [policy.key]: valueIndex }))}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '1rem 0.75rem',
                      background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(30, 30, 30, 0.8)',
                      border: isSelected ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: isSelected ? '0 4px 16px rgba(255, 255, 255, 0.15)' : 'none'
                    }}
                  >
                    <ColorSquare value={valueIndex} size="60px" />
                    <span style={{ fontSize: '0.8125rem', color: '#ffffff', textAlign: 'center', lineHeight: 1.3, fontWeight: 500 }}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              {!isLastDimension ? (
                <button
                  onClick={() => setCurrentDimension(currentDimension + 1)}
                  style={{
                    padding: '1rem 2rem',
                    background: '#e5e5e5',
                    color: '#212121',
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
                  Next Dimension →
                </button>
              ) : (
                <button
                  onClick={() => setStep(3)}
                  style={{
                    padding: '1rem 2rem',
                    background: '#e5e5e5',
                    color: '#212121',
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
                  See Your Results →
                </button>
              )}
            </div>
          </div>
        );
      }

      case 3:
        return (
          <div style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ margin: '0 0 3rem 0', color: '#ffffff', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, lineHeight: 1.2, textAlign: 'center' }}>
              Your Political Spectrum
            </h2>
            
            <div style={{ textAlign: 'center', margin: '2rem 0', padding: '2.5rem 2rem', background: 'rgba(30, 30, 30, 0.8)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(0.75rem, 2vw, 1.5rem)', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {POLICIES.map((policy, i) => (
                  <div key={policy.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <ColorSquare value={spectrum[policy.key]} size="64px" />
                    <span style={{ fontSize: '0.75rem', color: '#a3a3a3', fontWeight: 600, letterSpacing: '0.02em' }}>
                      {['T', 'A', 'M', 'E', 'R'][i]}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(0.75rem, 2vw, 1.5rem)', flexWrap: 'wrap', marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                {POLICIES.map((policy) => (
                  <span key={policy.key} style={{ fontSize: '0.6875rem', color: '#737373', fontWeight: 500, textTransform: 'lowercase' }}>
                    {policy.label}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#737373', fontFamily: 'monospace' }}>
                {getSignatureText()}
              </div>
            </div>

            <button 
              onClick={handleCopy}
              style={{
                padding: '1.125rem 2rem',
                background: '#e5e5e5',
                color: '#212121',
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
              {copied ? '✓ Copied!' : 'Copy Signature'}
            </button>
            
            <button 
              onClick={() => window.open('https://squares.vote', '_blank', 'noopener,noreferrer')}
              style={{
                padding: '1.125rem 2rem',
                background: 'transparent',
                color: '#e5e5e5',
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
                  color: '#a3a3a3',
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
                  color: '#a3a3a3',
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
          background: '#212121',
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
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={() => onClose()}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(30, 30, 30, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#a3a3a3',
            lineHeight: 1,
            padding: 0,
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(40, 40, 40, 0.9)';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(30, 30, 30, 0.8)';
            e.currentTarget.style.color = '#a3a3a3';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          ×
        </button>
        
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center', marginBottom: step === 2 ? '1rem' : '0' }}>
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  width: i === step ? '32px' : '10px',
                  height: '10px',
                  borderRadius: '6px',
                  background: i === step ? '#e5e5e5' : (i < step ? 'rgba(229, 229, 229, 0.3)' : 'rgba(115, 115, 115, 0.3)'),
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: i === step ? 'scale(1)' : 'scale(0.9)'
                }}
              />
            ))}
          </div>
          
          {step === 2 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8125rem', color: '#a3a3a3', fontWeight: 600, marginBottom: '0.5rem' }}>
                Dimension {currentDimension + 1} of {POLICIES.length}
              </div>
              <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center' }}>
                {POLICIES.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: i <= currentDimension ? '#e5e5e5' : 'rgba(115, 115, 115, 0.3)',
                      transition: 'all 0.3s'
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

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
                  color: '#e5e5e5'
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
                color: '#212121',
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
                color: '#a3a3a3'
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
              ← Previous dimension
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
