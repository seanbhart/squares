import React from 'react';
import styles from './CoreLanding.module.css';
import { COLOR_RAMP, AXES } from '@/lib/bloc-config';

interface CoreIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartQuestionnaire?: () => void;
}

export default function CoreIntroModal({ isOpen, onClose, onStartQuestionnaire }: CoreIntroModalProps) {
  // Prevent bubbling up to the page container if clicked
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.introOverlay}>
      <button
        className={styles.introClose}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close intro modal"
      >
        ×
      </button>

      <div className={styles.introContent} onClick={handleContentClick}>
        {/* Section 1: Problem Statement */}
        <section className={styles.introSection}>
          <h1 className={styles.introTitle}>
            political labels are <span className={styles.brokenText}>broken</span>
          </h1>
          <div className={styles.labelCloud}>
            <span className={styles.blurLabel} style={{ animationDelay: '0s' }}>Liberal</span>
            <span className={styles.blurLabel} style={{ animationDelay: '0.2s' }}>Conservative</span>
            <span className={styles.blurLabel} style={{ animationDelay: '0.4s' }}>Moderate</span>
            <span className={styles.blurLabel} style={{ animationDelay: '0.6s' }}>Libertarian</span>
          </div>
          <p className={styles.introSubtitle}>
            They cram your entire worldview into a single word.
            <br />
            But you're not one word—your politics are unique.
          </p>
          <div className={styles.scrollIndicator}>scroll to learn more ↓</div>
        </section>

        {/* Section 2: CORE Introduction + Spectrum (merged) */}
        <section className={styles.introSection}>
          <h2 className={styles.sectionTitle}>Meet CORE</h2>
          <p className={styles.sectionText}>
            CORE measures four independent dimensions of political thinking—from how you view civil rights to how you think about economic systems.
          </p>

          <div className={styles.coreGrid}>
            <div className={styles.coreItem}>
              <div className={styles.coreLetter}>C</div>
              <div className={styles.coreItemText}>
                <div className={styles.coreLabel}>Civil Rights</div>
                <div className={styles.coreDescription}>How tightly government should control individual behavior</div>
                <div className={styles.coreAxis}>{AXES.civilRights.lowLabel} ↔ {AXES.civilRights.highLabel}</div>
              </div>
            </div>
            <div className={styles.coreItem}>
              <div className={styles.coreLetter}>O</div>
              <div className={styles.coreItemText}>
                <div className={styles.coreLabel}>Openness</div>
                <div className={styles.coreDescription}>How global vs national you want borders and trade to be</div>
                <div className={styles.coreAxis}>{AXES.openness.lowLabel} ↔ {AXES.openness.highLabel}</div>
              </div>
            </div>
            <div className={styles.coreItem}>
              <div className={styles.coreLetter}>R</div>
              <div className={styles.coreItemText}>
                <div className={styles.coreLabel}>Redistribution</div>
                <div className={styles.coreDescription}>How much markets vs the state should shape the economy</div>
                <div className={styles.coreAxis}>{AXES.redistribution.lowLabel} ↔ {AXES.redistribution.highLabel}</div>
              </div>
            </div>
            <div className={styles.coreItem}>
              <div className={styles.coreLetter}>E</div>
              <div className={styles.coreItemText}>
                <div className={styles.coreLabel}>Ethics</div>
                <div className={styles.coreDescription}>How quickly social norms should change vs be preserved</div>
                <div className={styles.coreAxis}>{AXES.ethics.lowLabel} ↔ {AXES.ethics.highLabel}</div>
              </div>
            </div>
          </div>

          <p className={styles.sectionText} style={{ marginTop: '2rem' }}>
            Each dimension is a spectrum. Instead of a label, you'll see exactly where you sit on each one.
          </p>

          <div className={styles.spectrumExample}>
            <div className={styles.spectrumSquaresWrapper}>
              {[COLOR_RAMP.purple, COLOR_RAMP.blue, COLOR_RAMP.green, COLOR_RAMP.gold, COLOR_RAMP.orange, COLOR_RAMP.red].map((color, i) => (
                <div key={i} className={styles.squareColumn}>
                  <div
                    className={styles.spectrumSquare}
                    style={{
                      backgroundColor: color,
                      opacity: 1
                    }}
                  />
                </div>
              ))}
            </div>
            <div className={styles.sliderLabels}>
              <span className={styles.sliderPole}>Low intensity</span>
              <span className={styles.sliderPole}>High intensity</span>
            </div>
          </div>
        </section>

        {/* Section 3: CTA with time estimate and privacy note */}
        <section className={styles.introSection}>
          <div className={styles.ctaContainer}>
            <button
              className={styles.startCta}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              Select your positions directly
            </button>

            {onStartQuestionnaire && (
              <>
                <div className={styles.ctaDivider}>or</div>
                <button
                  className={styles.secondaryCta}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartQuestionnaire();
                  }}
                >
                  Help me find my positions
                </button>
                <p className={styles.ctaHelperText}>
                  Answer 16 scenario-based questions
                </p>
              </>
            )}

            <p className={styles.ctaFootnote}>
              Takes about 3 minutes. Your results are private.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
