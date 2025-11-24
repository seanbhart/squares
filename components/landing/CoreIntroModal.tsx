import React from 'react';
import styles from './CoreLanding.module.css';
import { COLOR_RAMP, AXES } from '@/lib/bloc-config';

interface CoreIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CoreIntroModal({ isOpen, onClose }: CoreIntroModalProps) {
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
        {/* Section 1: Problem + Promise */}
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
            they cram complex beliefs into one word
          </p>
          <div className={styles.scrollIndicator}>scroll to learn more ↓</div>
        </section>

        {/* Section 2: Four Dimensions */}
        <section className={styles.introSection}>
          <h2 className={styles.sectionTitle}>meet CORE</h2>
          <p className={styles.sectionText}>
            your political DNA across four independent dimensions
          </p>
          
          <div className={styles.coreGrid}>
            <div className={styles.coreItem}>
              <div className={styles.coreLetter}>C</div>
              <div className={styles.coreItemText}>
                <div className={styles.coreLabel}>Civil Rights</div>
                <div className={styles.coreDescription}>how tightly government should control individual behavior</div>
                <div className={styles.coreAxis}>{AXES.civilRights.lowLabel} ↔ {AXES.civilRights.highLabel}</div>
              </div>
            </div>
            <div className={styles.coreItem}>
              <div className={styles.coreLetter}>O</div>
              <div className={styles.coreItemText}>
                <div className={styles.coreLabel}>Openness</div>
                <div className={styles.coreDescription}>how global vs national you want borders and trade to be</div>
                <div className={styles.coreAxis}>{AXES.openness.lowLabel} ↔ {AXES.openness.highLabel}</div>
              </div>
            </div>
            <div className={styles.coreItem}>
              <div className={styles.coreLetter}>R</div>
              <div className={styles.coreItemText}>
                <div className={styles.coreLabel}>Redistribution</div>
                <div className={styles.coreDescription}>how much markets vs the state should shape the economy</div>
                <div className={styles.coreAxis}>{AXES.redistribution.lowLabel} ↔ {AXES.redistribution.highLabel}</div>
              </div>
            </div>
            <div className={styles.coreItem}>
              <div className={styles.coreLetter}>E</div>
              <div className={styles.coreItemText}>
                <div className={styles.coreLabel}>Ethics</div>
                <div className={styles.coreDescription}>how quickly social norms should change vs be preserved</div>
                <div className={styles.coreAxis}>{AXES.ethics.lowLabel} ↔ {AXES.ethics.highLabel}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Spectrum Example */}
        <section className={styles.introSection}>
          <h2 className={styles.sectionTitle}>each dimension is a six color spectrum</h2>
          <p className={styles.sectionText}>
            you're not just "for" or "against" something
            <br />
            on each dimension, you sit somewhere between the two poles
          </p>
          
          <div className={styles.spectrumExample}>
            <div className={styles.exampleTitle}>example: civil rights</div>
            <div className={styles.spectrumSquaresWrapper}>
              {[COLOR_RAMP.purple, COLOR_RAMP.blue, COLOR_RAMP.green, COLOR_RAMP.gold, COLOR_RAMP.orange, COLOR_RAMP.red].map((color, i) => (
                <div key={i} className={styles.squareColumn}>
                  <div 
                    className={styles.spectrumSquare}
                    style={{ 
                      backgroundColor: color,
                      opacity: i === 2 ? 1 : 0.25
                    }}
                  />
                  <div className={i === 2 ? styles.selectedLabel : styles.unselectedLabel}>
                    {AXES.civilRights.values[i]}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.sliderLabels}>
              <span className={styles.sliderPole}>more {AXES.civilRights.lowLabel}</span>
              <span className={styles.sliderPole}>more {AXES.civilRights.highLabel}</span>
            </div>
          </div>
        </section>

        {/* Section 4: Bloc Mapping */}
        <section className={styles.introSection}>
          <h2 className={styles.sectionTitle}>your CORE is your political identity</h2>
          <p className={styles.sectionText}>
            after defining your position, we turn your four scores into a four-letter bloc and visual card.
          </p>
          
          <div className={styles.blocExample}>
            <div className={styles.exampleBlocCard}>
              <div className={styles.exampleBlocTitle}>example: Facilitator (LGSP)</div>
              <div className={styles.exampleBlocGrid}>
                <div className={styles.exampleSquare} style={{ backgroundColor: COLOR_RAMP.green }} />
                <div className={styles.exampleSquare} style={{ backgroundColor: COLOR_RAMP.blue }} />
                <div className={styles.exampleSquare} style={{ backgroundColor: COLOR_RAMP.red }} />
                <div className={styles.exampleSquare} style={{ backgroundColor: COLOR_RAMP.blue }} />
              </div>
              <div className={styles.exampleBlocBars}>
                <div className={styles.barsLeft}>
                  <div className={styles.spectrumRow}>
                    <span className={styles.barLabel}>C</span>
                    <div className={styles.miniSpectrumSquares}>
                      {[COLOR_RAMP.purple, COLOR_RAMP.blue, COLOR_RAMP.green, COLOR_RAMP.gold, COLOR_RAMP.orange, COLOR_RAMP.red].map((color, i) => (
                        <div 
                          key={i} 
                          className={styles.miniSquare}
                          style={{ 
                            backgroundColor: color,
                            opacity: i === 2 ? 1 : 0.2
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className={styles.spectrumRow}>
                    <span className={styles.barLabel}>O</span>
                    <div className={styles.miniSpectrumSquares}>
                      {[COLOR_RAMP.purple, COLOR_RAMP.blue, COLOR_RAMP.green, COLOR_RAMP.gold, COLOR_RAMP.orange, COLOR_RAMP.red].map((color, i) => (
                        <div 
                          key={i} 
                          className={styles.miniSquare}
                          style={{ 
                            backgroundColor: color,
                            opacity: i === 1 ? 1 : 0.2
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className={styles.spectrumRow}>
                    <span className={styles.barLabel}>R</span>
                    <div className={styles.miniSpectrumSquares}>
                      {[COLOR_RAMP.purple, COLOR_RAMP.blue, COLOR_RAMP.green, COLOR_RAMP.gold, COLOR_RAMP.orange, COLOR_RAMP.red].map((color, i) => (
                        <div 
                          key={i} 
                          className={styles.miniSquare}
                          style={{ 
                            backgroundColor: color,
                            opacity: i === 5 ? 1 : 0.2
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className={styles.spectrumRow}>
                    <span className={styles.barLabel}>E</span>
                    <div className={styles.miniSpectrumSquares}>
                      {[COLOR_RAMP.purple, COLOR_RAMP.blue, COLOR_RAMP.green, COLOR_RAMP.gold, COLOR_RAMP.orange, COLOR_RAMP.red].map((color, i) => (
                        <div 
                          key={i} 
                          className={styles.miniSquare}
                          style={{ 
                            backgroundColor: color,
                            opacity: i === 1 ? 1 : 0.2
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className={styles.barsRight}>
                  <div className={styles.definitionRow}>L = {AXES.civilRights.lowLabel} on Civil Rights</div>
                  <div className={styles.definitionRow}>G = {AXES.openness.lowLabel} on Openness</div>
                  <div className={styles.definitionRow}>S = {AXES.redistribution.highLabel} on Redistribution</div>
                  <div className={styles.definitionRow}>P = {AXES.ethics.lowLabel} on Ethics</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: CTA */}
        <section className={styles.introSection}>
          <button 
            className={styles.startCta} 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            find your bloc
          </button>
        </section>
      </div>
    </div>
  );
}
