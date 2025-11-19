import React from 'react';
import styles from './CoreLanding.module.css';
import { COLOR_RAMP } from '@/lib/bloc-config';

interface CoreIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CoreIntroModal({ isOpen, onClose }: CoreIntroModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.introOverlay}>
      <button className={styles.introClose} onClick={onClose}>×</button>
      
      <div className={styles.introContent}>
        {/* Section 1: The Hook */}
        <section className={styles.introSection}>
          <h1 className={styles.introTitle}>
            Political labels are <span className={styles.brokenText}>broken</span>.
          </h1>
          <div className={styles.labelCloud}>
            <span className={styles.blurLabel} style={{ animationDelay: '0s' }}>Liberal</span>
            <span className={styles.blurLabel} style={{ animationDelay: '0.2s' }}>Conservative</span>
            <span className={styles.blurLabel} style={{ animationDelay: '0.4s' }}>Moderate</span>
            <span className={styles.blurLabel} style={{ animationDelay: '0.6s' }}>Libertarian</span>
          </div>
          <p className={styles.introSubtitle}>
            They reduce complex beliefs to oversimplified boxes.
            <br />
            You aren't just one word.
          </p>
        </section>

        {/* Section 2: CORE Explainer */}
        <section className={styles.introSection}>
          <h2 className={styles.sectionTitle}>Meet C.O.R.E.</h2>
          <p className={styles.sectionText}>
            Your unique political DNA across four dimensions.
          </p>
          
          <div className={styles.coreGrid}>
            <div className={styles.coreItem}>
              <div className={styles.coreLetter} style={{ color: COLOR_RAMP.purple }}>C</div>
              <div className={styles.coreLabel}>Civil Rights</div>
              <div className={styles.coreAxis}>Liberty ↔ Authority</div>
            </div>
            <div className={styles.coreItem}>
              <div className={styles.coreLetter} style={{ color: COLOR_RAMP.blue }}>O</div>
              <div className={styles.coreLabel}>Openness</div>
              <div className={styles.coreAxis}>Global ↔ National</div>
            </div>
            <div className={styles.coreItem}>
              <div className={styles.coreLetter} style={{ color: COLOR_RAMP.green }}>R</div>
              <div className={styles.coreLabel}>Redistribution</div>
              <div className={styles.coreAxis}>Market ↔ Social</div>
            </div>
            <div className={styles.coreItem}>
              <div className={styles.coreLetter} style={{ color: COLOR_RAMP.gold }}>E</div>
              <div className={styles.coreLabel}>Ethics</div>
              <div className={styles.coreAxis}>Progressive ↔ Traditional</div>
            </div>
          </div>
        </section>

        {/* Section 3: Spectrum */}
        <section className={styles.introSection}>
          <h2 className={styles.sectionTitle}>The Spectrum</h2>
          <p className={styles.sectionText}>
            It's not binary. Each square is a 6-point spectrum.
          </p>
          
          <div className={styles.spectrumDisplay}>
            <div className={styles.spectrumBar}>
              {[COLOR_RAMP.purple, COLOR_RAMP.blue, COLOR_RAMP.green, COLOR_RAMP.gold, COLOR_RAMP.orange, COLOR_RAMP.red].map((color, i) => (
                <div key={i} className={styles.spectrumColor} style={{ backgroundColor: color }} />
              ))}
            </div>
            <div className={styles.spectrumLabels}>
              <span>0 (Min)</span>
              <span>5 (Max)</span>
            </div>
          </div>
        </section>

        {/* Section 4: Historical Figures Placeholder */}
        <section className={styles.introSection}>
          <h2 className={styles.sectionTitle}>History's Patterns</h2>
          <p className={styles.sectionText}>
            See how famous figures map to the CORE framework.
          </p>
          
          <div className={styles.figuresPlaceholder}>
            <div className={styles.figureCard}>
              <div className={styles.figureAvatar}>?</div>
              <div className={styles.figureName}>Historical Figure</div>
              <div className={styles.figureGrid}>Coming Soon</div>
            </div>
            <div className={styles.figureCard}>
              <div className={styles.figureAvatar}>?</div>
              <div className={styles.figureName}>Modern Leader</div>
              <div className={styles.figureGrid}>Coming Soon</div>
            </div>
          </div>
        </section>

        {/* Section 5: CTA */}
        <section className={styles.introSection}>
          <button className={styles.startCta} onClick={onClose}>
            Find Your Bloc
          </button>
        </section>
      </div>
    </div>
  );
}
