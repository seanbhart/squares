'use client';

import { useState } from 'react';
import styles from './ColorScaleSection.module.css';
import { POLICIES, COLOR_RAMP } from '@/lib/tamer-config';

export default function ColorScaleSection() {
  const [selectedDimension, setSelectedDimension] = useState(0);
  
  const currentPolicy = POLICIES[selectedDimension];
  const dimensionLetters = ['T', 'A', 'M', 'E', 'R'];

  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <h2 className={styles.headline}>
          Each dimension uses a 7-color spectrum
        </h2>

        <div className={styles.scaleExplainer}>
          <div className={styles.scaleRow}>
            {COLOR_RAMP.map((color, index) => (
              <div
                key={index}
                className={styles.colorBlock}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          
          <div className={styles.scaleLabels}>
            <span className={styles.scaleLabel}>
              Minimal government intervention
            </span>
            <span className={styles.scaleArrow}>→</span>
            <span className={styles.scaleLabel}>
              Total government control
            </span>
          </div>
        </div>

        <div className={styles.dimensionSelector}>
          <p className={styles.selectorPrompt}>
            See what the scale means for each dimension:
          </p>
          <div className={styles.dimensionButtons}>
            {POLICIES.map((policy, index) => {
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
                <button
                  key={policy.key}
                  className={styles.dimensionButton}
                  data-active={selectedDimension === index}
                  onClick={() => setSelectedDimension(index)}
                >
                  <span
                    className={styles.buttonSquare}
                    style={{ backgroundColor: COLOR_RAMP[3] }}
                  >
                    {dimensionLetters[index]}
                  </span>
                  <span className={styles.buttonLabel}>
                    {displayLabel.line1}
                    {displayLabel.line2 && (
                      <>
                        <br />
                        {displayLabel.line2}
                      </>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.exampleScale}>
          <h3 className={styles.exampleTitle}>
            {currentPolicy.label}
          </h3>
          <div className={styles.exampleGradient}>
            {currentPolicy.colorRamp.map((label, index) => (
              <div
                key={index}
                className={styles.exampleStep}
              >
                <div
                  className={styles.exampleSquare}
                  style={{ backgroundColor: COLOR_RAMP[index] }}
                />
                <span className={styles.exampleLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
