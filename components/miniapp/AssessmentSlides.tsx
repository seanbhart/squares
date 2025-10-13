'use client';

import { useState, useEffect } from 'react';
import styles from './AssessmentSlides.module.css';

interface AssessmentSlidesProps {
  initialSpectrum?: UserSpectrum;
  initialStep?: number;
  initialIsPublic?: boolean;
  hideSpectrumCard?: boolean;
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
  abortion: ['partial birth abortion', 'limit after viability', 'limit after third trimester', 'limit after second trimester', 'limit after first trimester', 'limit after heartbeat detection', 'no exceptions allowed'],
  migration: ['open borders', 'easy pathways to citizenship', 'expanded quotas', 'current restrictions', 'reduced quotas', 'strict limits only', 'no immigration'],
  economics: ['pure free market', 'minimal regulation', 'market-based with safety net', 'balanced public-private', 'strong social programs', 'extensive public ownership', 'full state control'],
  rights: ['full legal equality', 'protections with few limits', 'protections with some limits', 'tolerance without endorsement', 'traditional definitions only', 'no legal recognition', 'criminalization']
};

function getEmojiSquare(value: number): string {
  const emojis = ['🟪', '🟦', '🟩', '🟨', '🟧', '🟥', '⬛️'];
  return emojis[value] || '🟨';
}

export default function AssessmentSlides({ initialSpectrum, initialStep = 0, initialIsPublic = false, hideSpectrumCard = false, onComplete, onVisibilityChange, onStepChange }: AssessmentSlidesProps) {
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
              You're many dimensions.
            </h2>
            <div className={styles.dimensionsGrid}>
              {POLICIES.map((policy, index) => {
                const letters = ['T', 'A', 'M', 'E', 'R'];
                const colors = ['#9b59b6', '#3498db', '#e74c3c', '#f39c12', '#2ecc71'];
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
              TAME-R measures where you stand on five<br />independent policy dimensions.
            </p>
            <button onClick={() => setStep(1)} className={styles.primaryButton}>
              Continue →
            </button>
          </div>
        );

      case 1: {
        const selectedPolicy = POLICIES[selectedSpectrumDimension];
        const letters = ['T', 'A', 'M', 'E', 'R'];
        const colors = ['#9b59b6', '#3498db', '#e74c3c', '#f39c12', '#2ecc71'];
        
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
                {['🟪', '🟦', '🟩', '🟨', '🟧', '🟥', '⬛️'].map((emoji, i) => (
                  <span key={i} className={styles.emojiSquare}>{emoji}</span>
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
                    <span className={styles.positionEmoji}>{getEmojiSquare(index)}</span>
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
                      {getEmojiSquare(valueIndex)}
                    </div>
                    <span className={styles.optionLabel}>{label}</span>
                  </button>
                );
              })}
            </div>

            <div className={styles.interventionScale}>
              <span>Minimal intervention</span>
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
        const emojiSignature = POLICIES.map(p => {
          const value = spectrum[p.key as keyof SpectrumState];
          return value !== null ? getEmojiSquare(value) : '⬜';
        });
        
        return (
          <div className={`${styles.resultsContainer} ${styles.darkSlide}`}>
            {!hideSpectrumCard && <h2 className={styles.headline}>Your Political Spectrum</h2>}
            
            {!hideSpectrumCard && (
              <div className={styles.signatureBox}>
                <div className={styles.emojiRow}>
                  {emojiSignature.map((emoji, i) => (
                    <div key={i} className={styles.emojiColumn}>
                      <span className={styles.largeEmoji}>{emoji}</span>
                      <span className={styles.emojiLabel}>{['T', 'A', 'M', 'E', 'R'][i]}</span>
                    </div>
                  ))}
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
                onClick={handleToggleVisibility} 
                className={styles.primaryButton}
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
