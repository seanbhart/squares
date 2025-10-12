'use client';

import React, { useState, useCallback } from 'react';

interface SquaresWidgetProps {
  onClose: () => void;
  primaryColor?: string;
}

const POLICIES = [
  { key: 'trade', label: 'Trade', emoji: '🌐' },
  { key: 'abortion', label: 'Abortion', emoji: '🤰' },
  { key: 'migration', label: 'Migration', emoji: '🌍' },
  { key: 'economics', label: 'Economics', emoji: '💰' },
  { key: 'rights', label: 'Rights', emoji: '🏳️‍🌈' },
];

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

function getEmojiSquare(value: number): string {
  const emojis = ['🟪', '🟦', '🟩', '🟨', '🟧', '🟥', '⬛️'];
  return emojis[value] || '🟨';
}

export function SquaresWidget({ onClose, primaryColor = '#4285f4' }: SquaresWidgetProps) {
  const [step, setStep] = useState(0);
  const [spectrum, setSpectrum] = useState<Record<string, number>>({
    trade: 3,
    abortion: 3,
    migration: 3,
    economics: 3,
    rights: 3,
  });
  const [copied, setCopied] = useState(false);

  const emojiSignature = POLICIES.map(p => getEmojiSquare(spectrum[p.key])).join('');

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(emojiSignature);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [emojiSignature]);

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div style={{ minHeight: '400px' }}>
            <h2 style={{ margin: '0 0 1rem 0', color: '#1a1a1a', fontSize: '1.8rem' }}>
              Welcome to squares.vote
            </h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#333', marginBottom: '1.5rem' }}>
              Map your political positions across five key policy dimensions using the <strong>TAME-R</strong> framework:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', margin: '1.5rem 0' }}>
              {POLICIES.map(policy => (
                <div key={policy.key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px', fontSize: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{policy.emoji}</span>
                  <strong style={{ color: '#1a1a1a' }}>{policy.label}</strong>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.9rem', color: '#666', textAlign: 'center', marginTop: '1rem' }}>
              Each dimension uses a 7-point scale from minimal government intervention to maximum control.
            </p>
          </div>
        );

      case 1:
        return (
          <div style={{ minHeight: '400px' }}>
            <h2 style={{ margin: '0 0 1rem 0', color: '#1a1a1a', fontSize: '1.8rem' }}>
              See How It Works
            </h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#333', marginBottom: '1.5rem' }}>
              Here are some historical figures mapped on the TAME-R spectrum:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1.5rem 0' }}>
              {EXAMPLE_FIGURES.map(figure => (
                <div key={figure.name} style={{ padding: '1.25rem', background: '#f8f9fa', borderRadius: '12px', border: '2px solid #e0e0e0' }}>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', color: '#1a1a1a' }}>{figure.name}</h3>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#1a1a1a', fontSize: '1rem', fontWeight: 600 }}>{figure.title}</p>
                  <p style={{ margin: '0.25rem 0 1rem 0', color: primaryColor, fontSize: '0.85rem', fontWeight: 500 }}>{figure.period}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '2rem', marginBottom: '0.5rem', justifyContent: 'flex-start' }}>
                    {figure.spectrum.map((val, idx) => (
                      <span key={idx} style={{ display: 'inline-block', width: '2rem' }}>
                        {getEmojiSquare(val)}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-start' }}>
                    {POLICIES.map(p => (
                      <span key={p.key} style={{ fontSize: '0.75rem', color: '#666', fontWeight: 600, textAlign: 'center', width: '2rem' }}>{p.label[0]}</span>
                    ))}
                  </div>
                  <p style={{ margin: '1rem 0 0 0', color: '#555', fontSize: '0.9rem', lineHeight: '1.5' }}>{figure.description}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.9rem', color: '#666', textAlign: 'center', marginTop: '1rem' }}>
              Each colored square represents their position on one dimension.
            </p>
          </div>
        );

      case 2:
        return (
          <div style={{ minHeight: '400px' }}>
            <h2 style={{ margin: '0 0 1rem 0', color: '#1a1a1a', fontSize: '1.8rem' }}>
              Map Your Squares
            </h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#333', marginBottom: '1.5rem' }}>
              Adjust each slider to reflect your political positions. Each scale represents minimal to maximal government control or intervention:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', margin: '1.5rem 0' }}>
              {POLICIES.map(policy => (
                <div key={policy.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontWeight: 600, fontSize: '1.1rem', color: '#1a1a1a' }}>
                      {policy.emoji} {policy.label}
                    </label>
                    <span style={{ fontSize: '1.8rem' }}>
                      {getEmojiSquare(spectrum[policy.key])}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    value={spectrum[policy.key]}
                    onChange={(e) => setSpectrum(prev => ({
                      ...prev,
                      [policy.key]: parseInt(e.target.value)
                    }))}
                    style={{
                      width: '100%',
                      height: '8px',
                      borderRadius: '4px',
                      background: 'linear-gradient(to right, #9333ea, #3b82f6, #10b981, #eab308, #f97316, #ef4444, #000)',
                      outline: 'none',
                      WebkitAppearance: 'none',
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                    <span>Minimal</span>
                    <span>Maximal</span>
                  </div>
                  <p style={{ margin: 0, padding: '0.75rem', background: '#f8f9fa', borderRadius: '6px', fontSize: '0.95rem', color: '#1a1a1a', fontWeight: 500, textAlign: 'center', border: '2px solid #e0e0e0' }}>
                    {POSITION_LABELS[policy.key][spectrum[policy.key]]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div style={{ minHeight: '400px' }}>
            <h2 style={{ margin: '0 0 1rem 0', color: '#1a1a1a', fontSize: '1.8rem' }}>
              Your Political Signature
            </h2>
            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
              <div style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', letterSpacing: 'clamp(0.2rem, 1vw, 0.5rem)', marginBottom: '1rem', wordBreak: 'break-all', lineHeight: '1.2' }}>
                {emojiSignature}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(0.5rem, 3vw, 2.5rem)', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {POLICIES.map(p => (
                  <span key={p.key} style={{ fontSize: '0.85rem', color: '#666', fontWeight: 600, whiteSpace: 'nowrap' }}>{p.label}</span>
                ))}
              </div>
            </div>
            <button 
              onClick={handleCopy}
              style={{
                padding: '1rem 2rem',
                background: primaryColor,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%',
                marginBottom: '1rem'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </button>
            <button 
              onClick={() => window.open('https://squares.vote', '_blank', 'noopener,noreferrer')}
              style={{
                padding: '1rem 2rem',
                background: 'white',
                color: primaryColor,
                border: `2px solid ${primaryColor}`,
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%',
                marginBottom: '1rem'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = primaryColor;
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = primaryColor;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Explore More at squares.vote →
            </button>
            <p style={{ fontSize: '0.9rem', color: '#666', textAlign: 'center', marginTop: '0.5rem' }}>
              Share your squares on social media
            </p>
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
      onClick={onClose}
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
          background: 'white',
          borderRadius: '16px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'slideUp 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '2rem',
            cursor: 'pointer',
            color: '#666',
            lineHeight: 1,
            padding: 0,
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#f0f0f0';
            e.currentTarget.style.color = '#000';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = '#666';
          }}
        >
          ×
        </button>
        
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: i <= step ? primaryColor : '#e0e0e0',
                transition: 'all 0.3s',
                transform: i <= step ? 'scale(1.2)' : 'scale(1)'
              }}
            />
          ))}
        </div>

        {renderStep()}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e0e0e0' }}>
          {step > 0 && (
            <button 
              onClick={() => setStep(step - 1)}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: '#f0f0f0',
                color: '#333'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#e0e0e0'}
              onMouseOut={(e) => e.currentTarget.style.background = '#f0f0f0'}
            >
              ← Back
            </button>
          )}
          {step < 3 ? (
            <button 
              onClick={() => setStep(step + 1)}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: primaryColor,
                color: 'white',
                marginLeft: 'auto'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 4px 12px rgba(66, 133, 244, 0.3)`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Next →
            </button>
          ) : (
            <button 
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: primaryColor,
                color: 'white',
                marginLeft: 'auto'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 4px 12px rgba(66, 133, 244, 0.3)`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
