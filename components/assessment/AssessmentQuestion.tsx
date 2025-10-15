'use client';

import styles from './AssessmentQuestion.module.css';
import { getScoreColor, POLICIES } from '@/lib/tamer-config';
import type { PolicyKey } from '@/lib/tamer-config';

interface AssessmentQuestionProps {
  policyKey: PolicyKey;
  label: string;
  colorRamp: readonly string[];
  letter: string;
  currentIndex: number;
  totalQuestions: number;
  value: number;
  onChange: (value: number) => void;
  completedIndices: number[];
  hasBeenTouched?: boolean;
  allAnswers?: Record<number, number>;
}

export default function AssessmentQuestion({
  policyKey,
  label,
  colorRamp,
  letter,
  currentIndex,
  totalQuestions,
  value,
  onChange,
  completedIndices,
  hasBeenTouched = false,
  allAnswers = {},
}: AssessmentQuestionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.progress}>
            <span className={styles.progressText}>
              {currentIndex + 1} of {totalQuestions}
            </span>
            <div className={styles.progressBar}>
              {Array.from({ length: totalQuestions }).map((_, i) => {
                const isComplete = completedIndices.includes(i);
                const isCurrent = i === currentIndex;
                const answerValue = allAnswers[i];
                const policy = POLICIES[i];
                const dotColor = isComplete && answerValue !== undefined
                  ? getScoreColor(policy.key, answerValue)
                  : undefined;
                
                return (
                  <div
                    key={i}
                    className={styles.progressDot}
                    data-complete={isComplete}
                    data-current={isCurrent}
                    style={dotColor ? { backgroundColor: dotColor } : undefined}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.questionArea}>
          <div className={styles.dimensionBadge}>
            <span
              className={styles.badgeSquare}
              style={{ backgroundColor: getScoreColor(policyKey, value) }}
            >
              {letter}
            </span>
          </div>

          <h2 className={styles.question}>{label}</h2>
          
          <p className={styles.instruction}>
            Where do you stand on government intervention?
          </p>

          <div className={styles.scaleContainer}>
            {colorRamp.map((optionLabel, valueIndex) => {
              const isSelected = value === valueIndex;
              const isCenterOption = valueIndex === 3; // Center is index 3 (0-6 scale)
              const isTentative = isCenterOption && isSelected && !hasBeenTouched;
              const color = getScoreColor(policyKey, valueIndex);
              
              return (
                <button
                  key={valueIndex}
                  className={styles.option}
                  data-selected={isSelected}
                  data-tentative={isTentative}
                  onClick={() => onChange(valueIndex)}
                >
                  <div
                    className={styles.optionSquare}
                    style={{ backgroundColor: color }}
                  >
                    {isSelected && !isTentative && (
                      <span className={styles.checkmark}>✓</span>
                    )}
                  </div>
                  <span className={styles.optionLabel}>{optionLabel}</span>
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

        <div className={styles.continueHint}>
          {currentIndex < totalQuestions - 1 
            ? "Scroll down for next Square ↓"
            : "Scroll down to see your results ↓"
          }
        </div>
      </div>
    </section>
  );
}
