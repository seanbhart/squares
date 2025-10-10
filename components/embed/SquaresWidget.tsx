'use client';

import { useState, useCallback } from 'react';
import styles from './SquaresWidget.module.css';

interface SquaresWidgetProps {
  onClose: () => void;
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

export default function SquaresWidget({ onClose }: SquaresWidgetProps) {
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
          <div className={styles.stepContent}>
            <h2>Welcome to Squares.vote</h2>
            <p className={styles.intro}>
              Map your political positions across five key policy dimensions using the <strong>TAME-R</strong> framework:
            </p>
            <div className={styles.dimensions}>
              {POLICIES.map(policy => (
                <div key={policy.key} className={styles.dimension}>
                  <span className={styles.dimensionEmoji}>{policy.emoji}</span>
                  <strong>{policy.label}</strong>
                </div>
              ))}
            </div>
            <p className={styles.note}>
              Each dimension uses a 7-point scale from minimal government intervention to maximum control.
            </p>
          </div>
        );

      case 1:
        return (
          <div className={styles.stepContent}>
            <h2>See How It Works</h2>
            <p className={styles.intro}>
              Here are some historical figures mapped on the TAME-R spectrum:
            </p>
            <div className={styles.examples}>
              {EXAMPLE_FIGURES.map(figure => (
                <div key={figure.name} className={styles.exampleCard}>
                  <h3>{figure.name}</h3>
                  <p className={styles.periodTitle}>{figure.title}</p>
                  <p className={styles.period}>{figure.period}</p>
                  <div className={styles.exampleSquares}>
                    {figure.spectrum.map((val, idx) => (
                      <span key={idx} className={styles.square}>
                        {getEmojiSquare(val)}
                      </span>
                    ))}
                  </div>
                  <div className={styles.labels}>
                    {POLICIES.map(p => (
                      <span key={p.key} className={styles.label}>{p.label[0]}</span>
                    ))}
                  </div>
                  <p className={styles.description}>{figure.description}</p>
                </div>
              ))}
            </div>
            <p className={styles.note}>
              Each colored square represents their position on one dimension.
            </p>
          </div>
        );

      case 2:
        return (
          <div className={styles.stepContent}>
            <h2>Map Your Squares</h2>
            <p className={styles.intro}>
              Adjust each slider to reflect your political positions. Each scale represents minimal to maximal government control or intervention:
            </p>
            <div className={styles.sliders}>
              {POLICIES.map(policy => (
                <div key={policy.key} className={styles.sliderGroup}>
                  <div className={styles.sliderHeader}>
                    <label>{policy.emoji} {policy.label}</label>
                    <span className={styles.currentSquare}>
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
                    className={styles.slider}
                  />
                  <div className={styles.sliderLabels}>
                    <span>Minimal</span>
                    <span>Maximal</span>
                  </div>
                  <p className={styles.positionDescription}>
                    {POSITION_LABELS[policy.key][spectrum[policy.key]]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className={styles.stepContent}>
            <h2>Your Political Signature</h2>
            <div className={styles.result}>
              <div className={styles.resultSquares}>
                {emojiSignature}
              </div>
              <div className={styles.resultLabels}>
                {POLICIES.map(p => (
                  <span key={p.key} className={styles.resultLabel}>{p.label}</span>
                ))}
              </div>
            </div>
            <button onClick={handleCopy} className={styles.copyButton}>
              {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </button>
            <p className={styles.note}>
              Share your squares on social media or explore more at{' '}
              <a href="https://squares.vote" target="_blank" rel="noopener noreferrer">
                squares.vote
              </a>
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        
        <div className={styles.progress}>
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`${styles.progressDot} ${i <= step ? styles.active : ''}`}
            />
          ))}
        </div>

        {renderStep()}

        <div className={styles.navigation}>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className={styles.navButton}>
              ← Back
            </button>
          )}
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} className={styles.navButtonPrimary}>
              Next →
            </button>
          ) : (
            <button onClick={onClose} className={styles.navButtonPrimary}>
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
