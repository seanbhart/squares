'use client';

import { useEffect, useState } from 'react';
import styles from './RealitySection.module.css';

const DIMENSIONS = [
  { letter: 'T', word: 'Trade', color: '#9b59b6' },
  { letter: 'A', word: 'Abortion', color: '#3498db' },
  { letter: 'M', word: 'Migration', color: '#e74c3c' },
  { letter: 'E', word: 'Economics', color: '#f39c12' },
  { letter: 'R', word: 'Rights', color: '#2ecc71' },
];

export default function RealitySection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation when section comes into view
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    const section = document.getElementById('reality-section');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="reality-section" className={styles.section}>
      <div className={styles.content}>
        <h2 className={styles.headline}>
          You're not one word.
        </h2>
        <h2 className={styles.headline}>
          You're five dimensions.
        </h2>

        <div className={styles.dimensionsGrid} data-visible={isVisible}>
          {DIMENSIONS.map((dim, index) => (
            <div
              key={dim.letter}
              className={styles.dimension}
              style={{
                animationDelay: `${index * 0.15}s`,
              }}
            >
              <div
                className={styles.square}
                style={{ backgroundColor: dim.color }}
              >
                <span className={styles.letter}>{dim.letter}</span>
              </div>
              <span className={styles.word}>{dim.word}</span>
            </div>
          ))}
        </div>

        <p className={styles.subtext}>
          TAME-R measures where you stand on five independent policy areas.
        </p>
      </div>

      <div className={styles.scrollHint}>
        <span className={styles.scrollText}>Scroll to continue</span>
        <div className={styles.scrollArrow}>↓</div>
      </div>
    </section>
  );
}
