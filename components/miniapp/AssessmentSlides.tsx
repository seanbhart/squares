'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './AssessmentSlides.module.css';
import { COLOR_RAMP } from '@/lib/tamer-config';
import { ClipboardIcon, CheckIcon } from '@/components/icons';
import { sdk } from '@farcaster/miniapp-sdk';

interface AssessmentSlidesProps {
  initialSpectrum?: UserSpectrum;
  initialStep?: number;
  initialIsPublic?: boolean;
  hideSpectrumCard?: boolean;
  username?: string;
  onComplete: (spectrum: UserSpectrum, isPublic: boolean) => void;
  onVisibilityChange?: (isPublic: boolean) => void;
  onStepChange?: (step: number) => void;
}

interface UserSpectrum {
  trade: number;
  abortion: number;
  migration: number;
  economics: number;
  rights: number;
}

interface SpectrumState {
  trade: number | null;
  abortion: number | null;
  migration: number | null;
  economics: number | null;
  rights: number | null;
}

const POLICIES = [
  { key: 'trade', label: 'Trade', emoji: '🌐' },
  { key: 'abortion', label: 'Abortion', emoji: '🤰' },
  { key: 'migration', label: 'Migration', emoji: '🌍' },
  { key: 'economics', label: 'Economics', emoji: '💰' },
  { key: 'rights', label: 'Rights', emoji: '🏳️‍🌈' },
];

const POSITION_LABELS: Record<string, string[]> = {
  trade: ['free trade', 'minimal tariffs', 'selective trade agreements', 'balanced tariffs', 'strategic protections', 'heavy tariffs', 'closed economy'],
  abortion: ['no gestational limit', 'limit after second trimester', 'limit after viability', 'limit after 15 weeks', 'limit after first trimester', 'limit after heartbeat detection', 'total ban'],
  migration: ['open borders', 'easy pathways to citizenship', 'expanded quotas', 'current restrictions', 'reduced quotas', 'strict limits only', 'no immigration'],
  economics: ['pure free market', 'minimal regulation', 'market-based with safety net', 'balanced public-private', 'strong social programs', 'extensive public ownership', 'full state control'],
  rights: ['full legal equality', 'protections with few limits', 'protections with some limits', 'tolerance without endorsement', 'traditional definitions only', 'no legal recognition', 'criminalization']
};

function ColorSquare({ value, size = 36 }: { value: number; size?: number }) {
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: size >= 48 ? '10px' : '8px',
      backgroundColor: COLOR_RAMP[value],
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      flexShrink: 0
    }} />
  );
}

export default function AssessmentSlides({ initialSpectrum, initialStep = 0, initialIsPublic = false, hideSpectrumCard = false, username, onComplete, onVisibilityChange, onStepChange }: AssessmentSlidesProps) {
  const [step, setStep] = useState(initialStep);
  const [currentDimension, setCurrentDimension] = useState(0);
  const [selectedSpectrumDimension, setSelectedSpectrumDimension] = useState(0);
  const [autoSaved, setAutoSaved] = useState(false);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [hasInitialSpectrum] = useState(!!initialSpectrum);
  const [spectrum, setSpectrum] = useState<SpectrumState>(initialSpectrum ? {
    trade: initialSpectrum.trade,
    abortion: initialSpectrum.abortion,
    migration: initialSpectrum.migration,
    economics: initialSpectrum.economics,
    rights: initialSpectrum.rights,
  } : {
    trade: null,
    abortion: null,
    migration: null,
    economics: null,
    rights: null,
  });

  // Notify parent of step changes
  useEffect(() => {
    if (onStepChange) {
      onStepChange(step);
    }
  }, [step, onStepChange]);

  // Auto-save when reaching step 3 (results)
  useEffect(() => {
    if (step === 3 && !autoSaved && spectrum.trade !== null && spectrum.abortion !== null && 
        spectrum.migration !== null && spectrum.economics !== null && spectrum.rights !== null) {
      onComplete(spectrum as UserSpectrum, isPublic); // Preserve existing isPublic status
      setAutoSaved(true);
    }
  }, [step, spectrum, autoSaved, onComplete, isPublic]);

  const handleToggleVisibility = () => {
    const newVisibility = !isPublic;
    setIsPublic(newVisibility);
    if (onVisibilityChange) {
      onVisibilityChange(newVisibility);
    }
    // Update the saved spectrum with new visibility
    if (spectrum.trade !== null && spectrum.abortion !== null && spectrum.migration !== null && 
        spectrum.economics !== null && spectrum.rights !== null) {
      onComplete(spectrum as UserSpectrum, newVisibility);
    }
  };

  const handleNextDimension = () => {
    const currentPolicy = POLICIES[currentDimension].key as keyof SpectrumState;
    
    // Only allow navigation if current dimension is selected
    if (spectrum[currentPolicy] === null) {
      return;
    }

    if (currentDimension < POLICIES.length - 1) {
      setCurrentDimension(currentDimension + 1);
    } else {
      setStep(3); // Go to results
    }
  };

  const handleStartOver = () => {
    setStep(0);
    setCurrentDimension(0);
    setAutoSaved(false);
    setSpectrum({
      trade: null,
      abortion: null,
      migration: null,
      economics: null,
      rights: null,
    });
  };

  const getEmojiSquare = (value: number) => {
    const emojis = ['🟪', '🟦', '🟩', '🟨', '🟧', '🟥', '⬛️'];
    return emojis[value] || '🟨';
  };

  const [copiedSpectrum, setCopiedSpectrum] = useState(false);

  const handleShare = useCallback(async () => {
    if (spectrum.trade === null || spectrum.abortion === null || spectrum.migration === null || 
        spectrum.economics === null || spectrum.rights === null) {
      return;
    }
    
    const emojis = POLICIES.map((p) => getEmojiSquare(spectrum[p.key as keyof SpectrumState]!)).join('');
    const shareText = `Just squared my politics with Squares! ${emojis}\n\nTry it:`;
    
    try {
      await sdk.actions.composeCast({
        text: shareText,
        embeds: ['https://farcaster.squares.vote/miniapp'],
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  }, [spectrum]);

  const handleCopySpectrum = useCallback(async () => {
    if (spectrum.trade === null || spectrum.abortion === null || spectrum.migration === null || 
        spectrum.economics === null || spectrum.rights === null) {
      return;
    }
    
    const emojis = POLICIES.map((p) => getEmojiSquare(spectrum[p.key as keyof SpectrumState]!)).join('');
    const text = username ? `${emojis} @${username}` : emojis;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSpectrum(true);
      setTimeout(() => setCopiedSpectrum(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [spectrum, username]);

  const handleClose = () => {
    if (hasInitialSpectrum && initialSpectrum) {
      // User has existing spectrum, go to results slide
      setStep(3);
      setSpectrum({
        trade: initialSpectrum.trade,
        abortion: initialSpectrum.abortion,
        migration: initialSpectrum.migration,
        economics: initialSpectrum.economics,
        rights: initialSpectrum.rights,
      });
    } else {
      // No existing spectrum, start over
      handleStartOver();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className={`${styles.slide} ${styles.darkSlide}`}>
            {hasInitialSpectrum && (
              <button onClick={handleClose} className={styles.closeButton} aria-label="Close">
                ✕
              </button>
            )}
            <h2 className={styles.headline}>
              You're not one word.<br />
              Your politics are unique.
            </h2>
            <div className={styles.dimensionsGrid}>
              {POLICIES.map((policy, index) => {
                const letters = ['T', 'A', 'M', 'E', 'R'];
                const colors = [COLOR_RAMP[0], COLOR_RAMP[1], COLOR_RAMP[6], COLOR_RAMP[4], COLOR_RAMP[2]];
                return (
                  <div key={policy.key} className={styles.dimensionCard}>
                    <div className={styles.dimensionSquareColored} style={{ backgroundColor: colors[index] }}>
                      <span className={styles.dimensionLetterColored}>{letters[index]}</span>
                    </div>
                    <span className={styles.dimensionLabel}>{policy.label.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
            <p className={styles.subtext}>
              Square yourself across five<br />political dimensions.
            </p>
            <button onClick={() => setStep(1)} className={styles.primaryButton}>
              Continue →
            </button>
          </div>
        );

      case 1: {
        const selectedPolicy = POLICIES[selectedSpectrumDimension];
        const letters = ['T', 'A', 'M', 'E', 'R'];
        const colors = [COLOR_RAMP[0], COLOR_RAMP[1], COLOR_RAMP[6], COLOR_RAMP[4], COLOR_RAMP[2]];
        
        return (
          <div className={`${styles.slide} ${styles.darkSlide}`}>
            <button onClick={handleClose} className={styles.closeButton} aria-label="Close">
              ✕
            </button>
            <h2 className={styles.headline}>
              Each dimension uses a<br />7-color spectrum
            </h2>
            
            <div className={styles.colorScale}>
              <div className={styles.emojiRow}>
                {COLOR_RAMP.map((color, i) => (
                  <ColorSquare key={i} value={i} size={36} />
                ))}
              </div>
              
              <div className={styles.scaleLabels}>
                <span>Minimal intervention</span>
                <span>→</span>
                <span>Total control</span>
              </div>
            </div>

            <p className={styles.selectorPrompt}>
              See what the scale means for each dimension:
            </p>

            <div className={styles.dimensionSelector}>
              {POLICIES.map((policy, index) => (
                <button
                  key={policy.key}
                  onClick={() => setSelectedSpectrumDimension(index)}
                  className={`${styles.selectorButton} ${selectedSpectrumDimension === index ? styles.active : ''}`}
                >
                  <div className={styles.selectorSquare}>
                    <span>{letters[index]}</span>
                  </div>
                  <span>{policy.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            <div className={styles.exampleBox}>
              <h3>{selectedPolicy.label}</h3>
              <div className={styles.positionsList}>
                {POSITION_LABELS[selectedPolicy.key].map((label, index) => (
                  <div key={index} className={styles.positionItem}>
                    <div className={styles.positionEmoji}>
                      <ColorSquare value={index} size={28} />
                    </div>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setStep(2)} className={styles.primaryButton}>
              Continue →
            </button>
          </div>
        );
      }

      case 2: {
        const policy = POLICIES[currentDimension];
        const letters = ['T', 'A', 'M', 'E', 'R'];
        const isLastDimension = currentDimension === POLICIES.length - 1;
        const currentSelection = spectrum[policy.key as keyof SpectrumState];
        const hasSelection = currentSelection !== null;
        
        const handleSelectionClick = (valueIndex: number) => {
          setSpectrum(prev => ({ ...prev, [policy.key]: valueIndex }));
          
          // Auto-advance after a brief delay to show selection
          setTimeout(() => {
            if (currentDimension < POLICIES.length - 1) {
              setCurrentDimension(currentDimension + 1);
            } else {
              setStep(3); // Go to results
            }
          }, 400);
        };
        
        return (
          <div className={`${styles.slide} ${styles.darkSlide}`}>
            <button onClick={handleClose} className={styles.closeButton} aria-label="Close">
              ✕
            </button>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#a3a3a3', fontWeight: 600, marginBottom: '0.75rem', letterSpacing: '0.1em' }}>
                {currentDimension + 1} OF {POLICIES.length}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                {POLICIES.map((_, i) => (
                  <div 
                    key={i}
                    style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      backgroundColor: i === currentDimension ? '#737373' : '#404040',
                      transition: 'background-color 0.2s'
                    }} 
                  />
                ))}
              </div>
            </div>
            <div className={styles.dimensionHeader}>
              <div className={styles.dimensionBadge}>
                <span>{letters[currentDimension]}</span>
              </div>
              <h2>{policy.label}</h2>
              <p>Where do you stand on government intervention?</p>
            </div>

            <div className={styles.optionsGrid}>
              {POSITION_LABELS[policy.key].map((label, valueIndex) => {
                const isSelected = currentSelection === valueIndex;
                return (
                  <button
                    key={valueIndex}
                    onClick={() => handleSelectionClick(valueIndex)}
                    className={`${styles.optionCard} ${isSelected ? styles.selected : ''}`}
                  >
                    <div className={styles.optionEmoji}>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ColorSquare value={valueIndex} size={48} />
                        {isSelected && (
                          <span className={styles.checkmark}>✓</span>
                        )}
                      </div>
                    </div>
                    <span className={styles.optionLabel}>{label}</span>
                  </button>
                );
              })}
            </div>

            <div className={styles.interventionScale}>
              <span>Minimal intervention</span>
              <span>→</span>
              <span>Total control</span>
            </div>

            <div className={styles.navigationButtons}>
              {currentDimension > 0 && (
                <button onClick={() => setCurrentDimension(currentDimension - 1)} className={styles.secondaryButton}>
                  ← Previous
                </button>
              )}
              <button 
                onClick={handleNextDimension} 
                className={styles.primaryButton}
                disabled={!hasSelection}
                style={{ opacity: hasSelection ? 1 : 0.5, cursor: hasSelection ? 'pointer' : 'not-allowed' }}
              >
                {isLastDimension ? 'See Results →' : 'Next Dimension →'}
              </button>
            </div>

            <div className={styles.progress}>
              Dimension {currentDimension + 1} of {POLICIES.length}
            </div>
          </div>
        );
      }

      case 3: {
        return (
          <div className={`${styles.resultsContainer} ${styles.darkSlide}`}>
            {!hideSpectrumCard && <h2 className={styles.headline}>Your Political Spectrum</h2>}
            
            {!hideSpectrumCard && (
              <div className={styles.signatureBox}>
                <div className={styles.emojiRow}>
                  {POLICIES.map((policy, i) => {
                    const value = spectrum[policy.key as keyof SpectrumState];
                    return (
                      <div key={i} className={styles.emojiColumn}>
                        {value !== null ? (
                          <ColorSquare value={value} size={56} />
                        ) : (
                          <div style={{ width: '56px', height: '56px', borderRadius: '10px', backgroundColor: '#333', border: '1px solid rgba(255, 255, 255, 0.1)' }} />
                        )}
                        <span className={styles.emojiLabel}>{['T', 'A', 'M', 'E', 'R'][i]}</span>
                      </div>
                    );
                  })}
                  <button 
                    onClick={handleCopySpectrum}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      color: copiedSpectrum ? '#398a34' : '#a3a3a3',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Copy squares"
                  >
                    {copiedSpectrum ? <CheckIcon /> : <ClipboardIcon />}
                  </button>
                </div>
                
                <div className={styles.dimensionReference}>
                  {POLICIES.map((policy, i) => (
                    <span key={policy.key} className={styles.refLabel}>
                      {policy.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.resultsButtons}>
              <button 
                onClick={handleShare}
                className={styles.primaryButton}
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  marginBottom: '0.75rem'
                }}
              >
                Share Your Squares
              </button>

              <button 
                onClick={handleToggleVisibility} 
                className={styles.secondaryButton}
              >
                {isPublic ? 'Hide from Community' : 'Reveal to Community'}
              </button>

              <button onClick={handleStartOver} className={styles.secondaryButton}>
                Start Over
              </button>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      {renderStep()}
    </div>
  );
}
