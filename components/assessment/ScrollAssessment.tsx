'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ScrollAssessment.module.css';
import { POLICIES, getScoreColor, getEmojiSquare, COLOR_RAMP } from '@/lib/tamer-config';
import { ClipboardIcon, CheckIcon } from '@/components/icons';

type Answers = Record<number, number>; // dimensionIndex -> value

export default function ScrollAssessment() {
  const [answers, setAnswers] = useState<Answers>({});
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const containerRef = useRef<HTMLDivElement>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isComplete = Object.keys(answers).length === POLICIES.length;

  const handleAnswer = (dimensionIndex: number, value: number) => {
    setAnswers(prev => ({ ...prev, [dimensionIndex]: value }));
    
    // Auto-advance to next section after a brief delay
    setTimeout(() => {
      if (containerRef.current) {
        const sections = containerRef.current.querySelectorAll('section');
        const nextSection = sections[dimensionIndex + 1];
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 300);
  };

  const emojiSignature = POLICIES.map((_, index) => {
    const value = answers[index] ?? 3;
    return getEmojiSquare(value);
  }).join('');

  const handleCopySquares = async () => {
    if (!emojiSignature) return;

    try {
      await navigator.clipboard.writeText(emojiSignature);
      setCopyState('copied');
    } catch (error) {
      console.error('Failed to copy squares', error);
      setCopyState('error');
      return;
    }

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }

    copyTimeoutRef.current = setTimeout(() => {
      setCopyState('idle');
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      {POLICIES.map((policy, index) => {
        const currentValue = answers[index] ?? 3;
        const letters = ['T', 'A', 'M', 'E', 'R'];
        
        return (
          <section key={policy.key} className={styles.section}>
            <div className={styles.content}>
              <div className={styles.header}>
                <div className={styles.progress}>
                  <span className={styles.progressText}>
                    {index + 1} of {POLICIES.length}
                  </span>
                  <div className={styles.progressBar}>
                    {POLICIES.map((_, i) => (
                      <div
                        key={i}
                        className={styles.progressDot}
                        data-complete={i in answers}
                        data-current={i === index}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.questionArea}>
                <div className={styles.dimensionBadge}>
                  <span
                    className={styles.badgeSquare}
                    style={{ backgroundColor: getScoreColor(policy.key, currentValue) }}
                  >
                    {letters[index]}
                  </span>
                </div>

                <h2 className={styles.question}>{policy.label}</h2>
                
                <p className={styles.instruction}>
                  Where do you stand on government intervention?
                </p>

                <div className={styles.scaleContainer}>
                  {policy.colorRamp.map((label, valueIndex) => {
                    const isSelected = currentValue === valueIndex;
                    const color = getScoreColor(policy.key, valueIndex);
                    
                    return (
                      <button
                        key={valueIndex}
                        className={styles.option}
                        data-selected={isSelected}
                        onClick={() => handleAnswer(index, valueIndex)}
                      >
                        <div
                          className={styles.optionSquare}
                          style={{ backgroundColor: color }}
                        >
                          {isSelected && (
                            <span className={styles.checkmark}>✓</span>
                          )}
                        </div>
                        <span className={styles.optionLabel}>{label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className={styles.scaleLabels}>
                  <span className={styles.scaleLabel}>Minimal intervention</span>
                  <span className={styles.scaleArrow}>→</span>
                  <span className={styles.scaleLabel}>Total control</span>
                </div>
              </div>

              {index < POLICIES.length - 1 && answers[index] !== undefined && (
                <div className={styles.continueHint}>
                  Scroll down for next dimension ↓
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* Results Section */}
      <section className={styles.section} data-results={true}>
        <div className={styles.content}>
          <div className={styles.resultsArea}>
            <h2 className={styles.resultsTitle}>Your Squares</h2>
            
            <div className={styles.squaresDisplay}>
              {POLICIES.map((policy, index) => {
                const value = answers[index] ?? 3;
                const color = getScoreColor(policy.key, value);
                const letters = ['T', 'A', 'M', 'E', 'R'];
                
                return (
                  <div key={policy.key} className={styles.resultSquare}>
                    <div
                      className={styles.resultSquareColor}
                      style={{ backgroundColor: color }}
                    >
                      <span className={styles.resultLetter}>{letters[index]}</span>
                    </div>
                    <span className={styles.resultLabel}>{policy.label}</span>
                  </div>
                );
              })}
            </div>

            <div className={styles.emojiSignature}>
              <span className={styles.emojiText}>{emojiSignature}</span>
              <button
                className={styles.copyButton}
                data-state={copyState}
                onClick={handleCopySquares}
                disabled={!isComplete}
              >
                {copyState === 'copied' ? <CheckIcon /> : <ClipboardIcon />}
                <span className={styles.copyButtonText}>
                  {copyState === 'copied' ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>

            {isComplete ? (
              <p className={styles.sharePrompt}>
                Share your pattern on social media or save it for later!
              </p>
            ) : (
              <p className={styles.incompleteMessage}>
                Answer all {POLICIES.length} dimensions to get your complete pattern
              </p>
            )}

            <div className={styles.actions}>
              <button
                className={styles.actionButton}
                onClick={() => window.location.href = '/'}
              >
                Start Over
              </button>
              <a
                href="/figures"
                className={styles.actionButton}
                data-secondary={true}
              >
                Explore Famous Figures
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
