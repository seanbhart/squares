'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './ResultsSection.module.css';
import { POLICIES, getScoreColor, getEmojiSquare } from '@/lib/tamer-config';
import { ClipboardIcon, CheckIcon } from '@/components/icons';

interface ResultsSectionProps {
  answers: Record<number, number>;
  onStartOver?: () => void;
}

export default function ResultsSection({ answers, onStartOver }: ResultsSectionProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isComplete = Object.keys(answers).length === POLICIES.length;

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

  const letters = ['T', 'A', 'M', 'E', 'R'];

  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <div className={styles.resultsArea}>
          <h2 className={styles.resultsTitle}>Your Squares</h2>
          
          <div className={styles.squaresDisplay}>
            {POLICIES.map((policy, index) => {
              const value = answers[index] ?? 3;
              const color = getScoreColor(policy.key, value);
              
              // Format labels to be consistent
              const getDisplayLabel = (label: string) => {
                if (label === 'Migration / Immigration') {
                  return { line1: 'Migration /', line2: 'Immigration' };
                }
                if (label === 'Rights (civil liberties)') {
                  return { line1: 'Rights', line2: '(civil liberties)' };
                }
                return { line1: label, line2: null };
              };
              
              const displayLabel = getDisplayLabel(policy.label);
              
              return (
                <div key={policy.key} className={styles.resultSquare}>
                  <div
                    className={styles.resultSquareColor}
                    style={{ backgroundColor: color }}
                  >
                    <span className={styles.resultLetter}>{letters[index]}</span>
                  </div>
                  <span className={styles.resultLabel}>
                    {displayLabel.line1}
                    {displayLabel.line2 && (
                      <>
                        <br />
                        {displayLabel.line2}
                      </>
                    )}
                  </span>
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
            <a
              href="/figures"
              className={styles.actionButton}
              data-primary={true}
            >
              Explore Famous Figures
            </a>
            <button
              className={styles.actionButton}
              data-secondary={true}
              onClick={() => {
                if (onStartOver) {
                  onStartOver();
                } else {
                  // Fallback for standalone usage
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
