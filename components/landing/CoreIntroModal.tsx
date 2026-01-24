'use client';

import React, { useState, useEffect } from 'react';
import styles from './CoreLanding.module.css';
import { COLOR_RAMP } from '@/lib/bloc-config';

interface CoreIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartQuestionnaire?: () => void;
}

// Dimension data for cycling display
const DIMENSIONS = [
  { letter: 'C', name: 'Civil Rights', description: 'Where you draw the line between freedom and order', color: COLOR_RAMP.purple },
  { letter: 'O', name: 'Openness', description: 'How far your sense of "us" extends', color: COLOR_RAMP.blue },
  { letter: 'R', name: 'Redistribution', description: 'Who you think should have what', color: COLOR_RAMP.green },
  { letter: 'E', name: 'Ethics', description: 'Whether progress should be fast or careful', color: COLOR_RAMP.gold },
];

export default function CoreIntroModal({ isOpen, onClose, onStartQuestionnaire }: CoreIntroModalProps) {
  const [activeDimension, setActiveDimension] = useState(0);

  // Auto-cycle through dimensions
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setActiveDimension((prev) => (prev + 1) % DIMENSIONS.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Reset dimension when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveDimension(0);
    }
  }, [isOpen]);

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  const currentDim = DIMENSIONS[activeDimension];

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
            labels <span className={styles.brokenText}>lie</span>
          </h1>
          <div className={styles.labelCloud}>
            <span className={styles.blurLabel} style={{ animationDelay: '0s' }}>Liberal</span>
            <span className={styles.blurLabel} style={{ animationDelay: '0.2s' }}>Conservative</span>
            <span className={styles.blurLabel} style={{ animationDelay: '0.4s' }}>Moderate</span>
            <span className={styles.blurLabel} style={{ animationDelay: '0.6s' }}>Libertarian</span>
          </div>
          <p className={styles.introSubtitle}>
            One word can't capture what you actually believe.
            <br />
            Your politics have depth—let's map it.
          </p>
          <div className={styles.scrollIndicator}>see how ↓</div>
        </section>

        {/* Section 2A: Meet CORE - Simple Concept */}
        <section className={styles.introSection}>
          <h2 className={styles.sectionTitle}>Four dimensions. One map.</h2>

          {/* Animated letters */}
          <div className={styles.coreLettersRow}>
            <span className={styles.coreLetterAnimated} style={{ color: COLOR_RAMP.purple, animationDelay: '0.2s' }}>C</span>
            <span className={styles.coreLetterDot}>·</span>
            <span className={styles.coreLetterAnimated} style={{ color: COLOR_RAMP.blue, animationDelay: '0.4s' }}>O</span>
            <span className={styles.coreLetterDot}>·</span>
            <span className={styles.coreLetterAnimated} style={{ color: COLOR_RAMP.green, animationDelay: '0.6s' }}>R</span>
            <span className={styles.coreLetterDot}>·</span>
            <span className={styles.coreLetterAnimated} style={{ color: COLOR_RAMP.gold, animationDelay: '0.8s' }}>E</span>
          </div>

          {/* Spectrum squares */}
          <div className={styles.spectrumSquaresContainer}>
            <div className={styles.introSpectrumRow}>
              {[COLOR_RAMP.purple, COLOR_RAMP.blue, COLOR_RAMP.green, COLOR_RAMP.gold, COLOR_RAMP.orange, COLOR_RAMP.red].map((color, i) => (
                <div
                  key={i}
                  className={styles.introSpectrumSquare}
                  style={{ backgroundColor: color, animationDelay: `${0.1 * i}s` }}
                />
              ))}
            </div>
            <p className={styles.spectrumCaption}>Where do you land on each?</p>
          </div>
        </section>

        {/* Section 2B: What CORE Measures - Cycling Single Card */}
        <section className={styles.introSection}>
          <h2 className={styles.sectionTitle}>What shapes your politics</h2>

          {/* Single cycling dimension display */}
          <div className={styles.dimensionCycler}>
            <div
              className={styles.dimensionDisplay}
              key={activeDimension}
            >
              <span className={styles.dimensionDisplayLetter} style={{ color: currentDim.color }}>
                {currentDim.letter}
              </span>
              <span className={styles.dimensionDisplayName}>{currentDim.name}</span>
              <span className={styles.dimensionDisplayDesc}>{currentDim.description}</span>
            </div>

            {/* Progress dots */}
            <div className={styles.dimensionDots}>
              {DIMENSIONS.map((_, i) => (
                <span
                  key={i}
                  className={`${styles.dimensionDot} ${i === activeDimension ? styles.dimensionDotActive : ''}`}
                  style={i === activeDimension ? { backgroundColor: DIMENSIONS[i].color } : {}}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: CTA */}
        <section className={styles.introSection}>
          <div className={styles.ctaContainer}>
            <button
              className={styles.startCta}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              I know where I stand
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
                  Help me figure it out
                </button>
                <p className={styles.ctaHelperText}>
                  16 quick scenarios
                </p>
              </>
            )}

            <p className={styles.ctaFootnote}>
              3 minutes. Completely private.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
